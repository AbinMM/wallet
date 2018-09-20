//
//  ViewController.m
//  eostoken
//
//  Created by xyg on 14/9/18.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import "DappsViewController.h"
#import <WebKit/WebKit.h>


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

@property(nonatomic,strong)WKWebView *wkWebview;
@property (nonatomic,strong) UIProgressView *progress;

/** js方法是否已添加 */
@property (nonatomic) BOOL IsAddJS;

@end

@implementation DappsViewController

- (void)viewDidLoad {
  [super viewDidLoad];
  self.navigationItem.leftBarButtonItem.tintColor = [UIColor redColor];
  self.navigationItem.leftItemsSupplementBackButton=YES;//左侧箭头
//  self.view.backgroundColor = [UIColor blackColor];
  
}

- (void)didReceiveMemoryWarning {
    [super didReceiveMemoryWarning];
     // Dispose of any resources that can be recreated.
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




-(void)showDapps:(NSURL *)url title:(NSString*)dappTitle{
  NSLog(@"RN传过来的url: %@", url);
  self.title=dappTitle;
  //1.创建config对象, 设置config的属性
  WKWebViewConfiguration *config = [[WKWebViewConfiguration alloc] init];
  config.preferences.javaScriptCanOpenWindowsAutomatically = YES;//default value is NO
  
  //2.创建userContentController对象; 绑定config
  WKUserContentController *userContentController = [WKUserContentController new];
  config.userContentController = userContentController;
  //2.1 监听JS消息的发送, 实现JS调OC必须要做的一步, 由于循环引用的问题, 该步骤移到 viewDidAppear 中
  
  CGFloat SCREEN_WIDTH = self.view.frame.size.width;
  CGFloat SCREEN_HEIGHT = self.view.frame.size.height;
  self.wkWebview = [[WKWebView alloc] initWithFrame:CGRectMake(0, 60, SCREEN_WIDTH, SCREEN_HEIGHT-20) configuration:config];
//  NSURLRequest *request =[NSURLRequest requestWithURL:url];
//  NSURL *urll = [NSURL URLWithString:@"https://m.ite.zone/#/ite4"];
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
    _progress = [[UIProgressView alloc]initWithFrame:CGRectMake(0, 64, WIDTH, 2)];
    _progress.tintColor = [UIColor blueColor];
    _progress.backgroundColor = [UIColor lightGrayColor];
    [self.view addSubview:_progress];
  }
  return _progress;
}

- (void)viewWillAppear:(BOOL)animated
{
  [super viewWillAppear:animated];

  //TODO:kvo监听，获得页面title和加载进度值
  [self.wkWebview addObserver:self forKeyPath:@"estimatedProgress" options:NSKeyValueObservingOptionNew context:NULL];
//  [self.wkWebview addObserver:self forKeyPath:@"title" options:NSKeyValueObservingOptionNew context:NULL];
  
  [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(returnValueToJS:) name:rnNotification object:nil];//通知监听
  
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
//  //DAPP title
//  else if ([keyPath isEqualToString:@"title"])
//  {
//    if (object == self.wkWebview)
//    {
//      self.title = self.wkWebview.title;
//    }
//    else
//    {
//      [super observeValueForKeyPath:keyPath ofObject:object change:change context:context];
//    }
//  }
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



-(void)returnValueToJS:(NSNotification *)sender {
  NSLog(@"收到通知：%@",sender.userInfo);
  
  NSDictionary *dict = sender.userInfo;
//  NSDictionary *rnBody = [dict objectForKey:@"rnBody"];
//  NSString *callback = [rnBody objectForKey:@"callback"];
//  NSString *returnData = [dict objectForKey:@"rnData"];
  
  NSString *callback = [dict objectForKey:@"callback"];
  NSString *resp = [dict objectForKey:@"resp"];
  
  NSLog(@"callfun=>%@",callback);
  if(callback==NULL){
    return ;
  }
  
  // 结果返回给js
  NSString *jsStr = [NSString stringWithFormat:@"%@('%@')",callback,resp];
  NSLog(@"jsStr=>%@",jsStr);
  dispatch_async(dispatch_get_main_queue(), ^{  // 跳转界面，在主线程进行UI操作
    [self.wkWebview evaluateJavaScript:jsStr completionHandler:^(id _Nullable result, NSError * _Nullable error) {
      NSLog(@"%@----%@",result, error);
    }];
  });
}

#pragma mark - WKScriptMessageHandler Delegate

// 接收到JS发送消息时调用
- (void)userContentController:(WKUserContentController *)userContentController didReceiveScriptMessage:(WKScriptMessage *)message {
  
  NSLog(@"DAPPS传过来的message.name: %@", message.name);
  NSLog(@"DAPPS传过来的message.body: %@", message.body);
  NSDictionary *body = [message.body objectForKey:@"body"];
  NSString *callback = [body objectForKey:@"callback"];
  NSString *params = [body objectForKey:@"params"];
  NSString *password = @"";
  NSString *device_id = @"";
  
  NSLog(@"callBackFun=>%@",callback);
  
  NSDictionary *dict = @{
                         @"methodName": message.name,
                         @"callback" : callback,
                         @"params" : params,
                         @"password":password,
                         @"device_id":device_id,
                         };
  
    
  if ([message.name isEqualToString:sdkGetWalletList]) {
    [[NSNotificationCenter defaultCenter] postNotificationName:@"sendCustomEventNotification" object:self userInfo:@{@"requestInfo":dict}];
  } else if ([message.name isEqualToString:sdkEosTokenTransfer]) {

  } else if ([message.name isEqualToString:sdkPushEosAction]) {
    
  }else{
    [[NSNotificationCenter defaultCenter] postNotificationName:@"sendCustomEventNotification" object:self userInfo:@{@"requestInfo":dict}];
  }
}

//清理WEB缓存
- (void)clearCache {
  
  if ([[UIDevice currentDevice].systemVersion floatValue] >= 9.0) {
    NSSet *websiteDataTypes
    = [NSSet setWithArray:@[
                            WKWebsiteDataTypeDiskCache,
                            //WKWebsiteDataTypeOfflineWebApplicationCache,
                            WKWebsiteDataTypeMemoryCache,
                            //WKWebsiteDataTypeLocalStorage,
                            //WKWebsiteDataTypeCookies,
                            //WKWebsiteDataTypeSessionStorage,
                            //WKWebsiteDataTypeIndexedDBDatabases,
                            //WKWebsiteDataTypeWebSQLDatabases
                            ]];
    //// All kinds of data
    //NSSet *websiteDataTypes = [WKWebsiteDataStore allWebsiteDataTypes];// 清除所有
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

@end
