type TLayout = "normal" | "top" | "bottom" | "left" | "right" | "center"
type TDirection = "lr" | "tb"
type TDockType =
    "file"
    | "outline"
    | "bookmark"
    | "tag"
    | "graph"
    | "globalGraph"
    | "backlink"
    | "backlinkOld"
    | "inbox"
type TDockPosition = "Left" | "Right" | "Top" | "Bottom"
type TWS = "main" | "filetree" | "protyle"
type TEditorMode = "preview" | "wysiwyg"
type TOperation = "insert"
    | "update"
    | "delete"
    | "move"
    | "foldHeading"
    | "unfoldHeading"
    | "setAttrs"
    | "updateAttrs"
    | "append"
type TBazaarType = "templates" | "icons" | "widgets" | "themes"
declare module "blueimp-md5"

interface Window {
    __localStorage__removeItem: (key: string) => void
    __localStorage__setItem: (key: string, value: string) => void
    dataLayer: any[]
    siyuan: ISiyuan
    webkit: any

    JSAndroid: {
        returnDesktop(): void
        openExternal(url: string): void
        changeStatusBarColor(color: string, mode: number): void
        writeClipboard(text: string): void
        writeImageClipboard(uri: string): void
        readClipboard(): string
    }

    goBack(): void

    showKeyboardToolbar(bottom?: number): void

    hideKeyboardToolbar(): void

    gtag(name: string, key: string | Date, value?: IObject): void;
}

interface ITextOption {
    color?: string,
    type: string
}

interface ISnippet {
    id?: string
    name: string
    type: string
    enabled: boolean
    content: string
}

interface IInbox {
    oId: string
    shorthandContent: string
    shorthandDesc: string
    shorthandFrom: number
    shorthandTitle: string
    shorthandURL: string
    hCreated: string
}

interface IPdfAnno {
    pages?: {
        index: number
        positions: number []
    }[]
    index?: number,
    color: string,
    type: string,
    content: string,
    id?: string,
    coords?: number[]
}

interface IBackStack {
    id: string,
    endId?: string,
    scrollTop?: number,
    callback?: string[],
    position?: { start: number, end: number }
    protyle?: IProtyle,
    isZoom?: boolean
}

interface IEmoji {
    id: string,
    title: string,
    title_zh_cn: string,
    items: {
        unicode: string,
        description: string,
        description_zh_cn: string,
        keywords: string
    }[]
}

interface INotebook {
    name: string
    id: string
    closed: boolean
    icon: string
    sort: number
}

interface ISiyuan {
    printWin?: import("electron").BrowserWindow
    transactionsTimeout?: number,
    transactions?: {
        protyle: IProtyle,
        doOperations: IOperation[],
        undoOperations: IOperation[]
    }[]
    reqIds: { [key: string]: number },
    editorIsFullscreen?: boolean,
    hideBreadcrumb?: boolean,
    notebooks?: INotebook[],
    emojis?: IEmoji[],
    backStack?: IBackStack[],
    mobileEditor?: import("../protyle").Protyle, // mobile
    user?: {
        userId: string
        userName: string
        userAvatarURL: string
        userHomeBImgURL: string
        userIntro: string
        userNickname: string
        userPaymentSum: string
        userSiYuanProExpireTime: number // -1 ???????????????0 ???????????????> 0 ????????????
        userSiYuanSubscriptionPlan: number // 0 ????????????/?????????1 ???????????????2 ????????????
        userSiYuanSubscriptionType: number // 0 ?????????1 ?????????2 ??????
        userSiYuanSubscriptionStatus: number // -1???????????????0??????????????????1??????????????????2???????????????
        userToken: string
        userTitles: { name: string, icon: string, desc: string }[]
    },
    dragElement?: HTMLElement,
    layout?: {
        layout?: import("../layout").Layout,
        centerLayout?: import("../layout").Layout,
        topDock?: import("../layout/dock").Dock,
        leftDock?: import("../layout/dock").Dock,
        rightDock?: import("../layout/dock").Dock,
        bottomDock?: import("../layout/dock").Dock,
    }
    config?: IConfig;
    ws: import("../layout/Model").Model,
    ctrlIsPressed?: boolean,
    altIsPressed?: boolean,
    shiftIsPressed?: boolean,
    menus?: import("../menus").Menus
    languages?: {
        [key: string]: any;
    }
    bookmarkLabel?: string[]
    blockPanels: import("../block/Panel").BlockPanel[],
    dialogs: import("../dialog").Dialog[],
}

interface IScrollAttr {
    startId: string,
    endId: string
    scrollTop: number,
    focusId?: string,
    focusStart?: number
    focusEnd?: number
    zoomInId?: string
}

interface IOperation {
    action: TOperation, // move??? delete ???????????? data
    id: string,
    data?: string, // updateAttr ??????  { old: IObject, new: IObject }
    parentID?: string
    previousID?: string
    retData?: any
    nextID?: string // insert ??????
}

interface IObject {
    [key: string]: string;
}

declare interface IDockTab {
    type: TDockType;
    size: { width: number, height: number }
    show: boolean
    icon: string
    hotkeyLangId: string
}

declare interface IOpenFileOptions {
    assetPath?: string, // asset ??????
    fileName?: string, // file ??????
    rootIcon?: string, // ????????????
    id?: string,  // file ??????
    rootID?: string, // file ??????
    position?: string, // file ?????? asset???????????????
    page?: number | string, // asset
    mode?: TEditorMode // file
    action?: string[]
    keepCursor?: boolean // file????????????????????? tab ???
    zoomIn?: boolean // ????????????
}

declare interface ILayoutOptions {
    direction?: TDirection;
    size?: string
    resize?: TDirection
    type?: TLayout
    element?: HTMLElement
}

declare interface ITab {
    icon?: string
    docIcon?: string
    title?: string
    panel?: string
    callback?: (tab: import("../layout/Tab").Tab) => void
}

declare interface IExport {
    fileAnnotationRefMode: number
    blockRefMode: number
    blockEmbedMode: number
    blockRefTextLeft: string
    blockRefTextRight: string
    tagOpenMarker: string
    tagCloseMarker: string
    pandocBin: string
    paragraphBeginningSpace: boolean;
    addTitle: boolean;
}

declare interface IEditor {
    readOnly: boolean;
    listLogicalOutdent: boolean;
    katexMacros: string;
    fullWidth: boolean;
    floatWindowMode: number;
    dynamicLoadBlocks: number;
    fontSize: number;
    generateHistoryInterval: number;
    historyRetentionDays: number;
    codeLineWrap: boolean;
    displayBookmarkIcon: boolean;
    displayNetImgMark: boolean;
    codeSyntaxHighlightLineNum: boolean;
    embedBlockBreadcrumb: boolean;
    plantUMLServePath: string;
    codeLigatures: boolean;
    codeTabSpaces: number;
    fontFamily: string;
    virtualBlockRef: string;
    virtualBlockRefExclude: string;
    virtualBlockRefInclude: string;
    blockRefDynamicAnchorTextMaxLen: number;

    emoji: string[];
}

declare interface IWebSocketData {
    cmd: string
    callback?: string
    data: any
    msg: string
    code: number
    sid: string
}

declare interface IAppearance {
    modeOS: boolean,
    hideStatusBar: boolean,
    nativeEmoji: boolean,
    customCSS: boolean,
    themeJS: boolean,
    mode: number, // 1 ?????????0 ??????
    icon: string,
    closeButtonBehavior: number  // 0????????????1?????????????????????
    codeBlockThemeDark: string
    codeBlockThemeLight: string
    themeDark: string
    themeLight: string
    icons: string[]
    lang: string
    iconVer: string
    themeVer: string
    lightThemes: string[]
    darkThemes: string[]
}

declare interface IFileTree {
    closeTabsOnStart: boolean
    alwaysSelectOpenedFile: boolean
    openFilesUseCurrentTab: boolean
    removeDocWithoutConfirm: boolean
    allowCreateDeeper: boolean
    refCreateSavePath: string
    createDocNameTemplate: string
    sort: number
    maxOpenTabCount: number
    maxListCount: number
}

declare interface IAccount {
    displayTitle: boolean
    displayVIP: boolean
}

declare interface IConfig {
    repo: {
        key: string
    },
    sync: {
        generateConflictDoc: boolean
        enabled: boolean
        mode: number
        synced: number
        stat: string
        interval: number
        cloudName: string
    },
    lang: string
    api: {
        token: string
    }
    newbie: boolean
    system: {
        networkProxy: {
            host: string
            port: string
            scheme: string
        }
        kernelVersion: string
        isInsider: boolean
        appDir: string
        workspaceDir: string
        confDir: string
        dataDir: string
        container: "std" | "android" | "docker" | "ios"
        isMicrosoftStore: boolean
        os: "windows" | "linux" | "darwin"
        homeDir: string
        xanadu: boolean
        udanax: boolean
        uploadErrLog: boolean
        disableGoogleAnalytics: boolean
        downloadInstallPkg: boolean
        networkServe: boolean
        fixedPort: boolean
        useExistingDB: boolean
    }
    localIPs: string[]
    readonly: boolean
    uiLayout: Record<string, any>
    langs: { label: string, name: string }[]
    appearance: IAppearance
    editor: IEditor,
    fileTree: IFileTree
    graph: IGraph
    keymap: IKeymap
    export: IExport
    accessAuthCode: string
    account: IAccount
    tag: {
        sort: number
    }
    search: {
        htmlBlock: boolean
        document: boolean
        heading: boolean
        list: boolean
        listItem: boolean
        codeBlock: boolean
        mathBlock: boolean
        table: boolean
        blockquote: boolean
        superBlock: boolean
        paragraph: boolean
        name: boolean
        alias: boolean
        memo: boolean
        custom: boolean
        limit: number
        caseSensitive: boolean
        backlinkMentionName: boolean
        backlinkMentionAlias: boolean
        backlinkMentionAnchor: boolean
        backlinkMentionDoc: boolean
        virtualRefName: boolean
        virtualRefAlias: boolean
        virtualRefAnchor: boolean
        virtualRefDoc: boolean
    }
}

declare interface IGraphCommon {
    d3: {
        centerStrength: number
        collideRadius: number
        collideStrength: number
        lineOpacity: number
        linkDistance: number
        linkWidth: number
        nodeSize: number
        arrow: boolean
    }
    type: {
        blockquote: boolean
        code: boolean
        heading: boolean
        list: boolean
        listItem: boolean
        math: boolean
        paragraph: boolean
        super: boolean
        table: boolean
        tag: boolean
    }
}

declare interface IGraph {
    global: {
        minRefs: number
        dailyNote: boolean
    } & IGraphCommon
    local: {
        dailyNote: boolean
    } & IGraphCommon
}

declare interface IKeymap {
    general: { [key: string]: IKeymapItem }
    editor: {
        general: { [key: string]: IKeymapItem }
        insert: { [key: string]: IKeymapItem }
        heading: { [key: string]: IKeymapItem }
        list: { [key: string]: IKeymapItem }
        table: { [key: string]: IKeymapItem }
    }
}

declare interface IKeymapItem {
    default: string,
    custom: string
}

declare interface IFile {
    icon: string;
    name1: string;
    alias: string;
    memo: string;
    bookmark: string;
    path: string;
    name: string;
    hMtime: string;
    hCtime: string;
    hSize: string;
    id: string;
    count: number;
    subFileCount: number;
}

declare interface IBlockTree {
    nodeType: string,
    hPath: string,
    subType: string,
    name: string,
    type: string,
    depth: number,
    url?: string,
    label?: string,
    id?: string,
    blocks?: IBlock[],
    count: number,
    children?: IBlockTree[]
}

declare interface IBlock {
    depth?: number,
    box?: string;
    path?: string;
    hPath?: string;
    id?: string;
    rootID?: string;
    type?: string;
    content?: string;
    def?: IBlock;
    defID?: string
    defPath?: string
    refText?: string;
    name?: string;
    memo?: string;
    alias?: string;
    refs?: IBlock[];
    children?: IBlock[]
    length?: number
    ial: IObject
}

declare interface IModels {
    editor: import("../editor").Editor [],
    graph: import("../layout/dock/Graph").Graph[],
    outline: import("../layout/dock/Outline").Outline[]
    backlink: import("../layout/dock/Backlink").Backlink[]
    asset: import("../asset").Asset[]
    search: import("../search").Search[]
}

declare interface IMenu {
    label?: string,
    click?: (element: HTMLElement) => void,
    type?: "separator" | "submenu" | "readonly",
    accelerator?: string,
    action?: string,
    id?: string,
    submenu?: IMenu[]
    disabled?: boolean
    icon?: string
    iconHTML?: string
    current?: boolean
    bind?: (element: HTMLElement) => void
}

declare interface IBazaarItem {
    readme: string
    stars: string
    author: string
    updated: string
    downloads: string
    current: false
    installed: false
    outdated: false
    name: string
    previewURL: string
    previewURLThumb: string
    repoHash: string
    repoURL: string
    url: string
    openIssues: number
    version: string
    modes: string[]
    hSize: string
    hInstallSize: string
    hInstallDate: string
    hUpdated: string
}
