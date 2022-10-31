// SiYuan - Build Your Eternal Digital Garden
// Copyright (c) 2020-present, b3log.org
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

package model

import (
	"bytes"
	"errors"
	"fmt"
	"sort"
	"strings"

	"github.com/88250/gulu"
	"github.com/88250/lute/ast"
	"github.com/88250/lute/html"
	"github.com/emirpasic/gods/sets/hashset"
	"github.com/facette/natsort"
	"github.com/siyuan-note/siyuan/kernel/search"
	"github.com/siyuan-note/siyuan/kernel/sql"
	"github.com/siyuan-note/siyuan/kernel/treenode"
	"github.com/siyuan-note/siyuan/kernel/util"
)

func RemoveTag(label string) (err error) {
	if "" == label {
		return
	}

	util.PushEndlessProgress(Conf.Language(116))
	util.RandomSleep(1000, 2000)

	tags := sql.QueryTagSpansByKeyword(label, 102400)
	treeBlocks := map[string][]string{}
	for _, tag := range tags {
		if blocks, ok := treeBlocks[tag.RootID]; !ok {
			treeBlocks[tag.RootID] = []string{tag.BlockID}
		} else {
			treeBlocks[tag.RootID] = append(blocks, tag.BlockID)
		}
	}

	for treeID, blocks := range treeBlocks {
		util.PushEndlessProgress("[" + treeID + "]")
		tree, e := loadTreeByBlockID(treeID)
		if nil != e {
			util.ClearPushProgress(100)
			return e
		}

		var unlinks []*ast.Node
		for _, blockID := range blocks {
			node := treenode.GetNodeInTree(tree, blockID)
			if nil == node {
				continue
			}

			if ast.NodeDocument == node.Type {
				if docTagsVal := node.IALAttr("tags"); strings.Contains(docTagsVal, label) {
					docTags := strings.Split(docTagsVal, ",")
					var tmp []string
					for _, docTag := range docTags {
						if docTag != label {
							tmp = append(tmp, docTag)
							continue
						}
					}
					node.SetIALAttr("tags", strings.Join(tmp, ","))
				}
				continue
			}

			nodeTags := node.ChildrenByType(ast.NodeTag)
			for _, nodeTag := range nodeTags {
				nodeLabels := nodeTag.ChildrenByType(ast.NodeText)
				for _, nodeLabel := range nodeLabels {
					if bytes.Equal(nodeLabel.Tokens, []byte(label)) {
						unlinks = append(unlinks, nodeTag)
					}
				}
			}
			nodeTags = node.ChildrenByType(ast.NodeTextMark)
			for _, nodeTag := range nodeTags {
				if nodeTag.IsTextMarkType("tag") {
					if label == nodeTag.TextMarkTextContent {
						unlinks = append(unlinks, nodeTag)
					}
				}
			}
		}
		for _, n := range unlinks {
			n.Unlink()
		}
		util.PushEndlessProgress(fmt.Sprintf(Conf.Language(111), tree.Root.IALAttr("title")))
		if err = writeJSONQueue(tree); nil != err {
			util.ClearPushProgress(100)
			return
		}
		util.RandomSleep(50, 150)
	}

	util.PushEndlessProgress(Conf.Language(113))
	sql.WaitForWritingDatabase()
	util.ReloadUI()
	return
}

func RenameTag(oldLabel, newLabel string) (err error) {
	if treenode.ContainsMarker(newLabel) {
		return errors.New(Conf.Language(112))
	}

	newLabel = strings.TrimSpace(newLabel)
	newLabel = strings.TrimPrefix(newLabel, "/")
	newLabel = strings.TrimSuffix(newLabel, "/")
	newLabel = strings.TrimSpace(newLabel)

	if "" == newLabel {
		return errors.New(Conf.Language(114))
	}

	if oldLabel == newLabel {
		return
	}

	util.PushEndlessProgress(Conf.Language(110))
	util.RandomSleep(500, 1000)

	tags := sql.QueryTagSpansByKeyword(oldLabel, 102400)
	treeBlocks := map[string][]string{}
	for _, tag := range tags {
		if blocks, ok := treeBlocks[tag.RootID]; !ok {
			treeBlocks[tag.RootID] = []string{tag.BlockID}
		} else {
			treeBlocks[tag.RootID] = append(blocks, tag.BlockID)
		}
	}

	for treeID, blocks := range treeBlocks {
		util.PushEndlessProgress("[" + treeID + "]")
		tree, e := loadTreeByBlockID(treeID)
		if nil != e {
			util.ClearPushProgress(100)
			return e
		}

		for _, blockID := range blocks {
			node := treenode.GetNodeInTree(tree, blockID)
			if nil == node {
				continue
			}

			if ast.NodeDocument == node.Type {
				if docTagsVal := node.IALAttr("tags"); strings.Contains(docTagsVal, oldLabel) {
					docTags := strings.Split(docTagsVal, ",")
					var tmp []string
					for _, docTag := range docTags {
						if docTag != oldLabel {
							tmp = append(tmp, docTag)
							continue
						}
						if !gulu.Str.Contains(newLabel, tmp) {
							tmp = append(tmp, newLabel)
						}
					}
					node.SetIALAttr("tags", strings.Join(tmp, ","))
				}
				continue
			}

			nodeTags := node.ChildrenByType(ast.NodeTag)
			for _, nodeTag := range nodeTags {
				nodeLabels := nodeTag.ChildrenByType(ast.NodeText)
				for _, nodeLabel := range nodeLabels {
					if bytes.Equal(nodeLabel.Tokens, []byte(oldLabel)) {
						nodeLabel.Tokens = bytes.ReplaceAll(nodeLabel.Tokens, []byte(oldLabel), []byte(newLabel))
					}
				}
			}
			nodeTags = node.ChildrenByType(ast.NodeTextMark)
			for _, nodeTag := range nodeTags {
				if nodeTag.IsTextMarkType("tag") {
					if oldLabel == nodeTag.TextMarkTextContent {
						nodeTag.TextMarkTextContent = strings.ReplaceAll(nodeTag.TextMarkTextContent, oldLabel, newLabel)
					}
				}
			}
		}
		util.PushEndlessProgress(fmt.Sprintf(Conf.Language(111), tree.Root.IALAttr("title")))
		if err = writeJSONQueue(tree); nil != err {
			util.ClearPushProgress(100)
			return
		}
		util.RandomSleep(50, 150)
	}

	util.PushEndlessProgress(Conf.Language(113))
	sql.WaitForWritingDatabase()
	util.ReloadUI()
	return
}

type TagBlocks []*Block

func (s TagBlocks) Len() int           { return len(s) }
func (s TagBlocks) Swap(i, j int)      { s[i], s[j] = s[j], s[i] }
func (s TagBlocks) Less(i, j int) bool { return s[i].ID < s[j].ID }

type Tag struct {
	Name     string `json:"name"`
	Label    string `json:"label"`
	Children Tags   `json:"children"`
	Type     string `json:"type"` // "tag"
	Depth    int    `json:"depth"`
	Count    int    `json:"count"`

	tags Tags
}

type Tags []*Tag

func BuildTags() (ret *Tags) {
	WaitForWritingFiles()
	sql.WaitForWritingDatabase()

	ret = &Tags{}
	labels := labelTags()
	tags := Tags{}
	for label, _ := range labels {
		tags = buildTags(tags, strings.Split(label, "/"), 0)
	}
	appendTagChildren(&tags, labels)
	sortTags(tags)
	ret = &tags
	return
}

func sortTags(tags Tags) {
	switch Conf.Tag.Sort {
	case util.SortModeNameASC:
		sort.Slice(tags, func(i, j int) bool {
			return util.PinYinCompare(util.RemoveEmoji(tags[i].Name), util.RemoveEmoji(tags[j].Name))
		})
	case util.SortModeNameDESC:
		sort.Slice(tags, func(j, i int) bool {
			return util.PinYinCompare(util.RemoveEmoji(tags[i].Name), util.RemoveEmoji(tags[j].Name))
		})
	case util.SortModeAlphanumASC:
		sort.Slice(tags, func(i, j int) bool {
			return natsort.Compare(util.RemoveEmoji((tags)[i].Name), util.RemoveEmoji((tags)[j].Name))
		})
	case util.SortModeAlphanumDESC:
		sort.Slice(tags, func(i, j int) bool {
			return natsort.Compare(util.RemoveEmoji((tags)[j].Name), util.RemoveEmoji((tags)[i].Name))
		})
	case util.SortModeRefCountASC:
		sort.Slice(tags, func(i, j int) bool { return (tags)[i].Count < (tags)[j].Count })
	case util.SortModeRefCountDESC:
		sort.Slice(tags, func(i, j int) bool { return (tags)[i].Count > (tags)[j].Count })
	default:
		sort.Slice(tags, func(i, j int) bool {
			return natsort.Compare(util.RemoveEmoji((tags)[i].Name), util.RemoveEmoji((tags)[j].Name))
		})
	}
}

func SearchTags(keyword string) (ret []string) {
	ret = []string{}

	labels := labelBlocksByKeyword(keyword)
	for label, _ := range labels {
		_, t := search.MarkText(label, keyword, 1024, Conf.Search.CaseSensitive)
		ret = append(ret, t)
	}
	sort.Strings(ret)
	return
}

func labelBlocksByKeyword(keyword string) (ret map[string]TagBlocks) {
	ret = map[string]TagBlocks{}

	tags := sql.QueryTagSpansByKeyword(keyword, Conf.Search.Limit)
	set := hashset.New()
	for _, tag := range tags {
		set.Add(tag.BlockID)
	}
	var blockIDs []string
	for _, v := range set.Values() {
		blockIDs = append(blockIDs, v.(string))
	}
	sort.SliceStable(blockIDs, func(i, j int) bool {
		return blockIDs[i] > blockIDs[j]
	})

	sqlBlocks := sql.GetBlocks(blockIDs)
	blockMap := map[string]*sql.Block{}
	for _, block := range sqlBlocks {
		blockMap[block.ID] = block
	}

	for _, tag := range tags {
		label := tag.Content

		parentSQLBlock := blockMap[tag.BlockID]
		block := fromSQLBlock(parentSQLBlock, "", 0)
		if blocks, ok := ret[label]; ok {
			blocks = append(blocks, block)
			ret[label] = blocks
		} else {
			ret[label] = []*Block{block}
		}
	}
	return
}

func labelTags() (ret map[string]Tags) {
	ret = map[string]Tags{}

	tagSpans := sql.QueryTagSpans("", 10240)
	for _, tagSpan := range tagSpans {
		label := tagSpan.Content
		if _, ok := ret[label]; ok {
			ret[label] = append(ret[label], &Tag{})
		} else {
			ret[label] = Tags{}
		}
	}
	return
}

func appendTagChildren(tags *Tags, labels map[string]Tags) {
	for _, tag := range *tags {
		tag.Label = tag.Name
		tag.Count = len(labels[tag.Label]) + 1
		appendChildren0(tag, labels)
		sortTags(tag.Children)
	}
}

func appendChildren0(tag *Tag, labels map[string]Tags) {
	sortTags(tag.tags)
	for _, t := range tag.tags {
		t.Label = tag.Label + "/" + t.Name
		t.Count = len(labels[t.Label]) + 1
		tag.Children = append(tag.Children, t)
	}
	for _, child := range tag.tags {
		appendChildren0(child, labels)
	}
}

func buildTags(root Tags, labels []string, depth int) Tags {
	if 1 > len(labels) {
		return root
	}

	i := 0
	for ; i < len(root); i++ {
		if (root)[i].Name == labels[0] {
			break
		}
	}
	if i == len(root) {
		root = append(root, &Tag{Name: html.EscapeHTMLStr(labels[0]), Type: "tag", Depth: depth})
	}
	depth++
	root[i].tags = buildTags(root[i].tags, labels[1:], depth)
	return root
}