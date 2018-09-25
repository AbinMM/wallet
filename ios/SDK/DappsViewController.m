//
//  ViewController.m
//  eostoken
//
//  Created by xyg on 14/9/18.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "DappsViewController.h"
#import <WebKit/WebKit.h>
#import "BottomDetailView.h"
#import "EncryptAlertView.h"
#import "BottomActionsView.h"

#import "XLPaymentSuccessHUD.h"
#import "XLPaymentLoadingHUD.h"


// 协议中名字相对应,还和js发送消息名字一样
#define sdkMethodName             @"methodName"         //通用方法
#define sdkEosTokenTransfer       @"eosTokenTransfer"   //转账
#define sdkPushEosAction          @"pushEosAction"      //
#define sdkGetAppInfo             @"getAppInfo"         //APP信息
#define sdkGetEosBalance          @"getEosBalance"      //获取余额
#define sdkGetTableRows           @"getTableRows"       //
#define sdkGetEosTableRows        @"getEosTableRows"       //
#define sdkGetEosAccountInfo      @"getEosAccountInfo"  //获取账户信息
#define sdkGetDeviceId            @"getDeviceId"        //获取设备ID
#define sdkGetWalletList          @"getWalletList"      //获取钱包列表
#define sdkShareNewsToSNS         @"shareNewsToSNS"     //分享信息
#define sdkInvokeQRScanner        @"invokeQRScanner"    //
#define sdkSign                   @"sign"               //签名
#define sdkEosAuthSign            @"eosAuthSign"        //EOS授权签名
#define sdkGetEosTransactionRecord  @"getEosTransactionRecord"    //
#define sdkGetCurrentWallet         @"getCurrentWallet"               //签名
#define sdkGetWallets               @"getWallets"        //EOS授权签名


#define rnNotification @"getValueFromRN"
@interface DappsViewController ()<WKScriptMessageHandler,WKNavigationDelegate,WKUIDelegate>
@property(nonatomic,strong)BottomDetailView *  bottomDetailView;
@property(nonatomic,strong)BottomActionsView * bottomActionsView;
@property(nonatomic,strong)WKWebView *wkWebview;
@property (nonatomic,strong) UIProgressView *progress;

/** js方法是否已添加 */
@property (nonatomic) BOOL IsAddJS;

/** js方法是否已添加 */
@property (nonatomic) BOOL IsBackMode;




@end

@implementation DappsViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  [self clearCache];

  self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc] initWithImage:[UIImage imageNamed:@"back"] style:(UIBarButtonItemStyleDone) target:self action:@selector(onBackItem)];
//  [[UINavigationBar appearance] setTintColor:[UIColor whiteColor]];
  //  self.view.backgroundColor = [UIColor colorWithRed:0.064 green:0.522 blue:1.000 alpha:1.000];

}

#pragma mark Actions
- (void)onBackItem{
  if ([self.wkWebview canGoBack]) {
    [self.wkWebview goBack];
  } else{
    [self.navigationController popViewControllerAnimated:YES];
  }
}


- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
     // Dispose of any resources that can be recreated.
}

- (void)viewWillAppear:(BOOL)animated
{
  [super viewWillAppear:animated];
  self.navigationController.navigationBar.translucent = NO;
  if(_IsBackMode){
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:0.262 green:0.325 blue:0.427 alpha:1.000];
  }else{
    self.navigationController.navigationBar.barTintColor = [UIColor colorWithRed:0.133 green:0.474 blue:0.772 alpha:1.000];
  }
  [self.navigationController.navigationBar setTitleTextAttributes:@{NSForegroundColorAttributeName:[UIColor whiteColor]}];
//  [[UINavigationBar appearance] setTintColor:[UIColor whiteColor]];
  self.navigationController.navigationBar.tintColor = [UIColor whiteColor];
//  self.navigationController.navigationBar.barTintColor = [UIColor greenColor];
  [self.navigationController.navigationBar setBackgroundImage:[UIImage new] forBarMetrics:UIBarMetricsDefault];
    //去除 navigationBar 底部的细线
//    self.navigationController.navigationBar.shadowImage = [UIImage new];
  
  
  
  //TODO:kvo监听，获得页面title和加载进度值
  [self.wkWebview addObserver:self forKeyPath:@"estimatedProgress" options:NSKeyValueObservingOptionNew context:NULL];
  //  [self.wkWebview addObserver:self forKeyPath:@"title" options:NSKeyValueObservingOptionNew context:NULL];
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(returnValueToJS:) name:rnNotification object:nil];//通知监听
  
}




- (void)addAllScriptMessageHandler {
  // 注意：name参数需要和协议中名字相对应 还和html发送消息名字一样
  WKUserContentController *userCC = self.wkWebview.configuration.userContentController;
  [userCC addScriptMessageHandler:self name:sdkMethodName];
  [userCC addScriptMessageHandler:self name:sdkEosTokenTransfer];
  [userCC addScriptMessageHandler:self name:sdkPushEosAction];
  [userCC addScriptMessageHandler:self name:sdkGetAppInfo];
  [userCC addScriptMessageHandler:self name:sdkGetEosBalance];
  [userCC addScriptMessageHandler:self name:sdkGetTableRows];
  [userCC addScriptMessageHandler:self name:sdkGetEosTableRows];
  [userCC addScriptMessageHandler:self name:sdkGetEosAccountInfo];
  [userCC addScriptMessageHandler:self name:sdkGetDeviceId];
  [userCC addScriptMessageHandler:self name:sdkGetWalletList];
  [userCC addScriptMessageHandler:self name:sdkShareNewsToSNS];
  [userCC addScriptMessageHandler:self name:sdkInvokeQRScanner];
  [userCC addScriptMessageHandler:self name:sdkSign];
  [userCC addScriptMessageHandler:self name:sdkEosAuthSign];
  
  [userCC addScriptMessageHandler:self name:sdkGetEosTransactionRecord];
  [userCC addScriptMessageHandler:self name:sdkGetCurrentWallet];
  [userCC addScriptMessageHandler:self name:sdkGetWallets];
  
  _IsAddJS = YES;
}

- (void)removeAllScriptMessageHandler {
  // 循环引用, 必须移除, 添加和移除一一对应
  WKUserContentController *userCC = self.wkWebview.configuration.userContentController;
  [userCC removeScriptMessageHandlerForName:sdkMethodName];
  [userCC removeScriptMessageHandlerForName:sdkEosTokenTransfer];
  [userCC removeScriptMessageHandlerForName:sdkPushEosAction];
  [userCC removeScriptMessageHandlerForName:sdkGetAppInfo];
  [userCC removeScriptMessageHandlerForName:sdkGetEosBalance];
  [userCC removeScriptMessageHandlerForName:sdkGetTableRows];
  [userCC removeScriptMessageHandlerForName:sdkGetEosTableRows];
  [userCC removeScriptMessageHandlerForName:sdkGetEosAccountInfo];
  [userCC removeScriptMessageHandlerForName:sdkGetDeviceId];
  [userCC removeScriptMessageHandlerForName:sdkGetWalletList];
  [userCC removeScriptMessageHandlerForName:sdkShareNewsToSNS];
  [userCC removeScriptMessageHandlerForName:sdkInvokeQRScanner];
  [userCC removeScriptMessageHandlerForName:sdkSign];
  [userCC removeScriptMessageHandlerForName:sdkEosAuthSign];
  
  [userCC removeScriptMessageHandlerForName:sdkGetEosTransactionRecord];
  [userCC removeScriptMessageHandlerForName:sdkGetCurrentWallet];
  [userCC removeScriptMessageHandlerForName:sdkGetWallets];
  _IsAddJS = NO;
}




-(void)showDapps:(NSURL *)url title:(NSString*)dappTitle theme:(NSString*)theme{
  NSLog(@"RN传过来的theme: %@", theme);
  self.title=dappTitle;
  
  if ([theme isEqualToString:@"true"]) {
    _IsBackMode=YES;
  }else{
    _IsBackMode=NO;
  }
  
  WKWebViewConfiguration *configuration = [[WKWebViewConfiguration alloc] init];
  WKPreferences *preferences = [WKPreferences new];
  preferences.javaScriptCanOpenWindowsAutomatically = YES;
  preferences.minimumFontSize = 10.0;
  configuration.preferences = preferences;

  CGFloat SCREEN_WIDTH = self.view.frame.size.width;
  CGFloat SCREEN_HEIGHT = self.view.frame.size.height;
  self.wkWebview = [[WKWebView alloc] initWithFrame:CGRectMake(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT-64) configuration:configuration];

  NSURLRequest *request =[NSURLRequest requestWithURL:url];
  [self.wkWebview loadRequest:request];
  
  self.wkWebview.backgroundColor = [UIColor groupTableViewBackgroundColor];
  self.wkWebview.navigationDelegate = self;
  
  [self.view addSubview:self.wkWebview];
}

- (void)viewDidAppear:(BOOL)animated {
  [super viewDidAppear:animated];
  if (!_IsAddJS) {
    [self addAllScriptMessageHandler];
  }
}


- (void)viewDidDisappear:(BOOL)animated {
  [super viewDidDisappear:animated];
  if (_IsAddJS) {
    [self removeAllScriptMessageHandler];
  }
}

- (void)viewWillDisappear:(BOOL)animated
{
  if ([self.navigationController.viewControllers indexOfObject:self]==NSNotFound)
  {
    NSLog(@"clicked navigationbar back button");
    [self.navigationController setNavigationBarHidden:YES];
    [self.navigationController popViewControllerAnimated:YES];
  }
}


#pragma mark 加载进度条
- (UIProgressView *)progress
{
  CGFloat WIDTH = self.view.frame.size.width;
  if (_progress == nil)
  {
    _progress = [[UIProgressView alloc]initWithFrame:CGRectMake(0, 0, WIDTH, 2)];
    _progress.tintColor = [UIColor blueColor];
    _progress.backgroundColor = [UIColor lightGrayColor];
    [self.view addSubview:_progress];
  }
  return _progress;
}

//等待Loading
-(void)showLoadingAnimation{

  //隐藏支付完成动画
  [XLPaymentSuccessHUD hideIn:self.view];
  //显示支付中动画
  [XLPaymentLoadingHUD showIn:self.view];
}

//操作成功
-(void)showSuccessAnimation{
  
  //隐藏支付中成动画
  [XLPaymentLoadingHUD hideIn:self.view];
  //显示支付完成动画
  [XLPaymentSuccessHUD showIn:self.view];
}

//操作完成
-(void)showHideinAnimation{
  
  //隐藏支付中成动画
  [XLPaymentLoadingHUD hideIn:self.view];
  //显示支付完成动画
  [XLPaymentSuccessHUD hideIn:self.view];
}

#pragma mark KVO的监听代理
- (void)observeValueForKeyPath:(NSString *)keyPath ofObject:(id)object change:(NSDictionary *)change context:(void *)context {
  
  //加载进度值
  if ([keyPath isEqualToString:@"estimatedProgress"])
  {
    if (object == self.wkWebview)
    {
      [self.progress setAlpha:1.0f];
      [self.progress setProgress:self.wkWebview.estimatedProgress animated:YES];
      if(self.wkWebview.estimatedProgress >= 1.0f)
      {
        [UIView animateWithDuration:0.5f
                              delay:0.3f
                            options:UIViewAnimationOptionCurveEaseOut
                         animations:^{
                           [self.progress setAlpha:0.0f];
                         }
                         completion:^(BOOL finished) {
                           [self.progress setProgress:0.0f animated:NO];
                         }];
      }
    }
    else
    {
      [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
    }
  }
  else
  {
    [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
  }
}

#pragma mark
- (void)dealloc
{
  [self.wkWebview removeObserver:self forKeyPath:@"estimatedProgress"];
//  [self.wkWebview removeObserver:self forKeyPath:@"title"];
  [[NSNotificationCenter defaultCenter] removeObserver:self];
  [self clearCache];
}

//清理WEB缓存
- (void)clearCache {
  
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 9.0) {
    
    //// All kinds of data
    NSSet *websiteDataTypes = [WKWebsiteDataStore allWebsiteDataTypes];// 清除所有
    //// Date from
    NSDate *dateFrom = [NSDate dateWithTimeIntervalSince1970:0];
    //// Execute
    [[WKWebsiteDataStore defaultDataStore] removeDataOfTypes:websiteDataTypes modifiedSince:dateFrom completionHandler:^{
      NSLog(@"清理缓存完毕");
    }];
    
  } else {
    
    NSString *libraryPath = [NSSearchPathForDirectoriesInDomains(NSLibraryDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString *cookiesFolderPath = [libraryPath stringByAppendingString:@"/Cookies"];
    NSError *errors;
    [[NSFileManager defaultManager] removeItemAtPath:cookiesFolderPath error:&errors];
    
  }
}



-(void)returnValueToJS:(NSNotification *)sender {
  NSLog(@"收到通知：%@",sender.userInfo);
  NSDictionary *dict = sender.userInfo;
  NSString *methodName = [dict objectForKey:@"methodName"];
  NSString *callback = [dict objectForKey:@"callback"];
  NSString *resp = [dict objectForKey:@"resp"];
  NSDictionary *respDict =[DappsViewController jsonToDict:resp];
  NSLog(@"respDict=>%@",respDict);
  NSNumber *result = [respDict objectForKey:@"result"];
  NSLog(@"respReturn=>%@",result);
  BOOL isSuccess=[result boolValue];;
  NSLog(@"isSuccess=>%d",isSuccess);
  if(callback==NULL){
    return ;
  }
  
  NSString *msgRet = [respDict objectForKey:@"msg"];
 
  
  
  
  // 结果返回给DAPPS
  NSString *jsStr = [NSString stringWithFormat:@"%@('%@')",callback,resp];
  NSLog(@"jsStr=>%@",jsStr);
  dispatch_async(dispatch_get_main_queue(), ^{  // 跳转界面，在主线程进行UI操作
    if(!isSuccess){
      if(msgRet!=NULL){
        [self toastTip:msgRet];//错误则加个吐司提示
      }
    }
    
    [self.wkWebview evaluateJavaScript:jsStr completionHandler:^(id _Nullable result, NSError * _Nullable error) {
      NSLog(@"%@----%@",result, error);
      if (([methodName isEqualToString:sdkEosTokenTransfer])||([methodName isEqualToString:sdkPushEosAction])) {
        if((error==nil)&&(isSuccess)){
          [self showSuccessAnimation];//操作成功
        }
        dispatch_time_t time = dispatch_time(DISPATCH_TIME_NOW, 1 * 1 * NSEC_PER_SEC);
        dispatch_after(time, dispatch_get_main_queue(), ^(void){
          [self showHideinAnimation];
        });
      }
    }];
  });
}

#pragma mark - WKScriptMessageHandler Delegate

// 接收到DAPPS发送消息时调用
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
  
  NSLog(@"DAPPS传过来的message.name: %@", message.name);
  NSLog(@"DAPPS传过来的message.body: %@", message.body);
  NSDictionary *body = [message.body objectForKey:@"body"];
  NSString *callback = [body objectForKey:@"callback"];
  NSString *params = [body objectForKey:@"params"];
  NSString *password = @"";
//  NSString *device_id = @"";
  NSString *deviceUUID =[[[UIDevice currentDevice] identifierForVendor] UUIDString];
  NSLog(@"deviceUUID：%@",deviceUUID);


  NSDictionary* paramDic = @{
               @"methodName": message.name,
               @"callback" : callback,
               @"params" : params,
               @"password":password,
               @"device_id":deviceUUID,
               };

    
  if ([message.name isEqualToString:sdkEosTokenTransfer]) {
    [self orderDetails:paramDic];
  } else if ([message.name isEqualToString:sdkPushEosAction]) {
    [self orderActionsDetails:paramDic];
  } else if ([message.name isEqualToString:sdkSign]) {
    [self inputPassword:paramDic];
  } else if ([message.name isEqualToString:sdkEosAuthSign]) {
    [self inputPassword:paramDic];
  } else if ([message.name isEqualToString:sdkGetDeviceId]) {
      NSString *resp = [NSString stringWithFormat:@"{\"device_id\":\"%@\"}",deviceUUID];
      [[NSNotificationCenter defaultCenter] postNotificationName:rnNotification object:self userInfo:@{@"methodName":message.name,@"callback":callback,@"resp":resp}];
  } else{
    [[NSNotificationCenter defaultCenter] postNotificationName:@"sendCustomEventNotification" object:self userInfo:@{@"requestInfo":paramDic}];
  }
}



//输入密码
- (void)inputPassword:(NSDictionary *)paramDic {
//  NSDictionary *paramDic = [dict objectForKey:@"paramDic"];
  EncryptAlertView *alertview = [[EncryptAlertView alloc] initWithFrame:CGRectMake(0, 0, 280, 150) withTitle:@"密码" alertMessage:nil confrimBolck:^(NSString * str){
    NSLog(@"paramDic:%@",paramDic);
    
    NSString *methodName = [paramDic objectForKey:@"methodName"];
    NSString *callback = [paramDic objectForKey:@"callback"];
    NSString *params = [paramDic objectForKey:@"params"];
    NSString *device_id = [paramDic objectForKey:@"device_id"];
    
    NSDictionary *dicData = @{
                              @"methodName": methodName,
                              @"callback" : callback,
                              @"params" : params,
                              @"password":str,
                              @"device_id":device_id,
                              };
    NSLog(@"button.paramDic:%@",dicData);
    if (([methodName isEqualToString:sdkEosTokenTransfer])||([methodName isEqualToString:sdkPushEosAction])) {
      [self showLoadingAnimation];
    }
    
    [[NSNotificationCenter defaultCenter] postNotificationName:@"sendCustomEventNotification" object:self userInfo:@{@"requestInfo":dicData}];

  } cancelBlock:^{
    NSLog(@"点击了取消");
  }];
  [alertview show];
}



//订单详情
- (void)orderDetails:(NSDictionary *)dict {
  NSString *params = [dict objectForKey:@"params"];

  NSDictionary *dicData =[DappsViewController jsonToDict:params];
  NSString *from = [dicData objectForKey:@"from"];
  NSString *to = [dicData objectForKey:@"to"];
  NSString *memo = [dicData objectForKey:@"memo"];
  NSString *amount = [dicData objectForKey:@"amount"];
  NSString *tokenName = [dicData objectForKey:@"tokenName"];
  NSString *strAmount = [NSString stringWithFormat:@"%@ %@",amount,tokenName];

  CGRect range = CGRectMake(0, self.view.frame.size.height - 250, kSCREEN_WIDTH, 250);
  self.bottomDetailView = [[BottomDetailView alloc] initWithFrame:range];
  [self.view addSubview: self.bottomDetailView];
  self.bottomDetailView.backgroundColor = [UIColor colorWithRed:0.9 green:0.9 blue:0.9 alpha:1];

  NSMutableArray * array = [[NSMutableArray alloc] init];
  [array addObject:@{@"paramDic":dict}];//第一个先将参数传过去
  [array addObject:@{@"title":@"订单类型:",@"content":@"转账"}];
  [array addObject:@{@"title":@"接收方:",@"content":from}];
  [array addObject:@{@"title":@"发送方:",@"content":to}];
  [array addObject:@{@"title":@"备注:",@"content":memo}];
  [array addObject:@{@"title":@"数量:",@"content":strAmount}];
  
  [self.bottomDetailView setDataArray:array];
  self.bottomDetailView.delegate = self;
  
}



-(void)cancelButtonClick:(id)sender{
  NSLog(@"cancelButtonClick");
  [self.bottomDetailView removeFromSuperview];
  
}

//确认支付
-(void)buttonSubmitClick:(id)sender{
  MyButton * button = (MyButton * )sender;
  [self.bottomDetailView removeFromSuperview];
  NSDictionary *paramDic = [button.paramDic objectForKey:@"paramDic"];
  [self inputPassword:paramDic];//输入密码
}

//json转成字典
+ (NSDictionary *)jsonToDict:(NSString *)jsonString {
  
    if (jsonString == nil) {
      return nil;
    }
    NSData *jsonData = [jsonString dataUsingEncoding:NSUTF8StringEncoding];
    NSError *err;
    NSDictionary *dicData = [NSJSONSerialization JSONObjectWithData:jsonData
                                                            options:NSJSONReadingMutableContainers
                                                              error:&err];
    if(err)
    {
      NSLog(@"json解析失败：%@",err);
      return nil;
    }
    return dicData;
}

// 字典转json字符串方法

-(NSString *)convertToJsonData:(NSDictionary *)dict
{
  
  NSError *error;
  
  NSData *jsonData = [NSJSONSerialization dataWithJSONObject:dict options:NSJSONWritingPrettyPrinted error:&error];
  
  NSString *jsonString;
  
  if (!jsonData) {
    
    NSLog(@"%@",error);
    
  }else{
    
    jsonString = [[NSString alloc]initWithData:jsonData encoding:NSUTF8StringEncoding];
    
  }
  
  NSMutableString *mutStr = [NSMutableString stringWithString:jsonString];
  
  NSRange range = {0,jsonString.length};
  
  //去掉字符串中的空格
  
  [mutStr replaceOccurrencesOfString:@" " withString:@"" options:NSLiteralSearch range:range];
  
  NSRange range2 = {0,mutStr.length};
  
  //去掉字符串中的换行符
  
  [mutStr replaceOccurrencesOfString:@"\n" withString:@"" options:NSLiteralSearch range:range2];
  
  return mutStr;
  
}

//Action订单详情
- (void)orderActionsDetails:(NSDictionary *)dict {

  NSMutableDictionary * mutDict = [[NSMutableDictionary alloc]initWithDictionary:dict];
  
  NSString *params = [dict objectForKey:@"params"];
  NSDictionary *parameD =[DappsViewController jsonToDict:params];
  NSMutableDictionary * mutDictParame = [[NSMutableDictionary alloc]initWithDictionary:parameD];

  NSString *account = [parameD objectForKey:@"account"];

  NSMutableArray * arrayActions = [parameD objectForKey:@"actions"];
  NSString *contractAccountName=@"";
  NSInteger count = [arrayActions count];
  for (int i = 0; i < count; i++) {
    NSDictionary *dictArr = arrayActions[i];
    NSString *accountAction    = dictArr[@"account"];
    NSString *name  = dictArr[@"name"];
    NSMutableArray * authActions = [dictArr objectForKey:@"authorization"];
    contractAccountName = [NSString stringWithFormat:@"%@->%@",accountAction,name];
    if(account==nil){
        NSInteger count2 = [authActions count];
        for (int  j= 0; j < count2; j++) {
          NSDictionary *dictAuth = authActions[j];
          NSString *actor = dictAuth[@"actor"];
          NSString *permission = dictAuth[@"permission"];
          if ([permission isEqualToString:@"active"]||[permission isEqualToString:@"owner"]){
            if(actor!=nil){
              account=actor;
              [mutDictParame setObject:account forKey:@"account"];
              NSString *strParame =[self convertToJsonData:(NSDictionary *)mutDictParame];
              [mutDict setObject:strParame forKey:@"params"];
              break;
            }
          }
        }
      }else{
        break;
      }
  }
  
//NSString *TESTparams = [NSString stringWithFormat:@"%@ %@ %@",params,params,params];

  
  CGRect range = CGRectMake(0, self.view.frame.size.height - 220, kSCREEN_WIDTH, 220);
  self.bottomActionsView = [[BottomActionsView alloc] initWithFrame:range];
  [self.view addSubview: self.bottomActionsView];
  self.bottomActionsView.backgroundColor = [UIColor colorWithRed:0.9 green:0.9 blue:0.9 alpha:1];
  
  NSMutableArray * array = [[NSMutableArray alloc] init];
  [array addObject:@{@"paramDic":mutDict}];//第一个先将参数传过去
  [array addObject:@{@"title":@"类型:",@"content":@"actions"}];
  [array addObject:@{@"title":@"接收方:",@"content":account}];
  self.bottomActionsView.delegate = self;
  [self.bottomActionsView setDataArray:array];
  self.bottomActionsView.lastLabelTitle.text =contractAccountName;
  self.bottomActionsView.lastLabelContent.text = params;
//  self.bottomActionsView.lastLabelContent.text = TESTparams;//params;

  
}



-(void)cancelActionsButtonClick:(id)sender{
  NSLog(@"cancelActionsButtonClick");
  [self.bottomActionsView removeFromSuperview];
  
}

-(void)buttonActionsSubmitClick:(id)sender{
  NSLog(@"buttonActionsSubmitClick");
  MyButton * button = (MyButton * )sender;
  [self.bottomActionsView removeFromSuperview];
  NSDictionary *paramDic = [button.paramDic objectForKey:@"paramDic"];
  [self inputPassword:paramDic];//输入密码
}


- (void)webViewWebContentProcessDidTerminate:(WKWebView *)webView{
  NSLog(@"webViewWebContentProcessDidTerminate:  当Web视图的网页内容被终止时调用。");
}


- (void)webView:(WKWebView *)webView didFinishNavigation:(null_unspecified WKNavigation *)navigation
{
  [UIApplication sharedApplication].networkActivityIndicatorVisible = NO;
  NSLog(@"webView:didFinishNavigation:  响应渲染完成后调用该方法   webView : %@  -- navigation : %@  \n\n",webView,navigation);
}


- (void)webView:(WKWebView *)webView didStartProvisionalNavigation:(null_unspecified WKNavigation *)navigation
{
  [UIApplication sharedApplication].networkActivityIndicatorVisible = YES;
  NSLog(@"webView:didStartProvisionalNavigation:  开始请求  \n\n");
}

- (void)webView:(WKWebView *)webView didCommitNavigation:(WKNavigation *)navigation {
  NSLog(@"webView:didCommitNavigation:   响应的内容到达主页面的时候响应,刚准备开始渲染页面应用 \n\n");
}


// error
- (void)webView:(WKWebView *)webView didFailProvisionalNavigation:(WKNavigation *)navigation withError:(NSError *)error {
  // 类似 UIWebView 的- webView:didFailLoadWithError:
  
  NSLog(@"webView:didFailProvisionalNavigation:withError: 启动时加载数据发生错误就会调用这个方法。  \n\n");
}



- (void)webView:(WKWebView *)webView didFailNavigation:(WKNavigation *)navigation withError:(NSError *)error{
  NSLog(@"webView:didFailNavigation: 当一个正在提交的页面在跳转过程中出现错误时调用这个方法。  \n\n");
}



- (void)webView:(WKWebView *)webView decidePolicyForNavigationAction:(WKNavigationAction *)navigationAction decisionHandler:(void (^)(WKNavigationActionPolicy))decisionHandler{
  
  NSLog(@"请求前会先进入这个方法  webView:decidePolicyForNavigationActiondecisionHandler: %@   \n\n  ",navigationAction.request);
  
  decisionHandler(WKNavigationActionPolicyAllow);
  
}

- (void)webView:(WKWebView *)webView decidePolicyForNavigationResponse:(WKNavigationResponse *)navigationResponse decisionHandler:(void (^)(WKNavigationResponsePolicy))decisionHandler{
  
  NSLog(@"返回响应前先会调用这个方法  并且已经能接收到响应webView:decidePolicyForNavigationResponse:decisionHandler: Response?%@  \n\n",navigationResponse.response);
  
  decisionHandler(WKNavigationResponsePolicyAllow);
}



- (void)webView:(WKWebView *)webView didReceiveServerRedirectForProvisionalNavigation:(WKNavigation *)navigation{
  
  NSLog(@"webView:didReceiveServerRedirectForProvisionalNavigation: 重定向的时候就会调用  \n\n");
  
}



/**
 获取指定宽度width的字符串在UITextView上的高度
 
 @param textView 待计算的UITextView
 @param width 限制字符串显示区域的宽度
 @return 返回的高度
 */
- (float)heightForString:(UITextView *)textView andWidth:(float)width {
  CGSize sizeToFit = [textView sizeThatFits:CGSizeMake(width, MAXFLOAT)];
  return sizeToFit.height;
}
#pragma mark - 显示提示信息
- (void)toastTip:(NSString *)toastInfo {
  CGRect frameRC = [[UIScreen mainScreen] bounds];
  
  frameRC.size.width = frameRC.size.width/2;
  frameRC.origin.x = kSCREEN_WIDTH/4;
  frameRC.origin.y = kSCREEN_HEIGHT*2/3;
  __block UITextView *toastView = [[UITextView alloc] init];
  
  toastView.editable = NO;
  toastView.selectable = NO;
  

  frameRC.size.height = [self heightForString:toastView andWidth:(frameRC.size.width)];
  toastView.frame = frameRC;
  
  toastView.text = toastInfo;
  toastView.backgroundColor = [UIColor whiteColor];
  toastView.alpha = 1;
  toastView.textAlignment = NSTextAlignmentCenter;
  toastView.font=[UIFont systemFontOfSize:14];
  toastView.layer.borderWidth=0.8;
  toastView.layer.borderColor=[UIColor whiteColor].CGColor;
  toastView.layer.cornerRadius=5.0;
  
  
  
  [self.view addSubview:toastView];
  
  dispatch_time_t popTime = dispatch_time(DISPATCH_TIME_NOW, 2 * NSEC_PER_SEC);
  
  dispatch_after(popTime, dispatch_get_main_queue(), ^() {
    [toastView removeFromSuperview];
    toastView = nil;
  });
}












@end
