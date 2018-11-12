
// var rootaddr = "http://api.eostoken.im";
// var rootaddr = "http://192.168.1.40:8088/api";
// var rootaddr = "http://192.168.1.76:8088/api";
var rootaddr = "";
export const bannerList = rootaddr + '/news/banner';
export const newsTypes = rootaddr + '/news/type';
export const address = rootaddr + '/coins/address';
export const newsList = rootaddr + '/news/';
export const findAllNews = rootaddr + '/news/findAllNews';

export const sticker = rootaddr + '/coins/deep';
export const line = rootaddr + '/coins/line/';
export const existRegisteredUser = rootaddr + '/existRegisteredUser';
export const capture = rootaddr + '/capture';
export const login = rootaddr + '/login';
export const signin = rootaddr + '/user/signin';
export const register = rootaddr + '/register';
export const changePwd = rootaddr + '/forget';
export const coinInfo = rootaddr + '/coins/info/';
export const upgrade = rootaddr + '/upgrade';
export const userInfo = rootaddr + '/user/info/';
export const inviteInfo = rootaddr + '/user/invite/';
export const getbind = rootaddr + '/user/getBindCode/';
export const bindCode = rootaddr + '/user/bindCode';
export const kapimg = rootaddr + '/kapimg/';
export const newsUp = rootaddr + '/news/up/';
export const newsDown = rootaddr + '/news/down/';
export const newsView = rootaddr + '/news/view/';
export const newsShare = rootaddr + '/news/share/';
export const redirect = rootaddr + '/news/redirect/';
export const sysNotificationList = rootaddr + '/news/sysNotificationList';
export const fetchPoint = rootaddr + '/user/point/fetch';
export const shareAddPoint = rootaddr + '/user/shareAddPoint';
export const eostReceive = rootaddr + '/user/eostReceive';
export const eostRecord = rootaddr + '/user/eostRecord';
export const selectPoint = rootaddr + '/user/selectPoint';

export const createAccount = rootaddr + '/user/createEosAccount';
export const pushTransaction = rootaddr + '/eosrpc/pushTransaction';
export const getBalance = rootaddr + '/eosrpc/getCurrencyBalance';
export const getInfo = rootaddr + '/eosrpc/getInfo';
export const getAccountInfo = rootaddr + '/eosrpc/getAccountInfo';
export const getVotingInfo = rootaddr + '/eosrpc/getVotingInfo';
export const getUndelegatebwInfo = rootaddr + '/eosrpc/getUndelegatebwInfo';

export const listProducers = rootaddr + '/eosrpc/listProducers';
export const listAgent = rootaddr + '/eoselector/list';

export const getAccountsByPuk = rootaddr + '/eosrpc/getKeyAccounts';
export const isExistAccountName = rootaddr + '/eosrpc/isExistAccountName';

export const getActions2 = rootaddr + '/eosrpc/getActions2'; // 新获取交易记录api， 20180928
export const getActions = rootaddr + '/eosrpc/getActions';
export const getintegral = rootaddr + '/pocketAsset/getCreateEosAccountNeedPoint';
export const isSigned = rootaddr + '/user/isSigned'
export const getGlobalInfo = rootaddr + '/eosrpc/getGlobalInfo'
export const queryRamPrice = rootaddr + '/eosrpc/queryRamPrice'
export const listAssets = rootaddr + '/coins/list';
export const addAssetToServer = rootaddr + '/coins/add';
export const fetchAssetsByAccount = rootaddr + '/coins/coins/';
export const getcoinInfo = rootaddr + '/coins/getInfo/';

export const isExistAccountNameAndPublicKey = rootaddr + '/eosrpc/isExistAccountNameAndPublicKey'
export const listDelegateLoglist = rootaddr + '/eosrpc/getAccountDelbandInfo'
export const delegatebw = rootaddr + '/eosrpc/delegatebw'

export const getRamInfo = rootaddr + '/ramprice/ramPriceInfo';
export const getRamPriceLine = rootaddr + '/ramprice/line/';
export const getRamTradeLog = rootaddr + '/ramprice/getNewTradeOrders';
export const getRamBigTradeLog = rootaddr + '/ramprice/getBigTradeOrders';
export const getRamTradeLogByAccount = rootaddr + '/ramprice/getNewTradeOrdersByAccountName';

export const getBigRamRank = rootaddr + '/ramprice/getLargeRamRank';

export const getRamKLines = rootaddr + '/ramprice/getRamKLines';

export const getETList = rootaddr + '/etExchangePrice/list';
export const getETInfo = rootaddr + '/etExchangePrice/info/';
export const getETPriceLine = rootaddr + '/etExchangePrice/line/';
export const getETKLine = rootaddr + '/etExchangePrice/kline';
export const getETTradeLog = rootaddr + '/etExchangePrice/getNewTradeOrders/';
export const getETBigTradeLog = rootaddr + '/etExchangePrice/getBigTradeOrders/';
export const getETTradeLogByAccount = rootaddr + '/etExchangePrice/getNewTradeOrdersByAccountName';
export const getETServiceStatus = rootaddr + '/etExchangePrice/isOpenET';
export const getLargeRankByCode = rootaddr + '/etExchangePrice/getLargeRankByCode/';
export const getEosShareholdersInfo = rootaddr + '/etExchangePrice/getEosShareholdersInfo';
export const getEosMarkets = rootaddr + '/etExchangePrice/getEosMarkets';

export const getFreeMortgage = rootaddr + '/eosrpc/delegatebwRecord';
export const getEosTransactionRecord = rootaddr + '/eosrpc/getEosTransactionRecord';
export const getEosTableRows = rootaddr + '/eosrpc/getEosTableRows';

export const dappfindAllHotRecommend = rootaddr + '/dapp/findAllHotRecommend'; //首页热门推荐
export const dappfindAllRecommend = rootaddr + '/dapp/findAllRecommendNew'; //首页分类推荐
export const dappfindAllByType = rootaddr + '/dapp/findAllByType'; //更多接口带分页
export const dappAdvertisement = rootaddr + '/advertising/getDappAd'; //两个广告位 
export const dappAdvertisementDetail = rootaddr + '/advertising/findById'; //读广告详情
export const dappfindByName = rootaddr + '/dapp/findByName'; //模糊搜索

export const atcgetInfo = rootaddr + '/act/getInfo';
export const getActivityStages = rootaddr + '/act/getActivityStages';
export const getWinActivityStageUsers = rootaddr + '/act/getWinActivityStageUsers';
export const getActivityStageUsers = rootaddr + '/act/getActivityStageUsers';

export const getcreateWxOrder = rootaddr + '/eosAccountOrder/createWxOrder';
export const getcheckBy = rootaddr + '/eosAccountOrder/checkByAccountNameAndOwnerPublicKey';
