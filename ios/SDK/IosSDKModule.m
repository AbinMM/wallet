//
//  IosSDKModule.m
//  eostoken
//
//  Created by xyg on 11/9/18.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import "IosSDKModule.h"
#import "AppDelegate.h"
#import "DappsViewController.h"

#define rnNotification @"getValueFromRN"

NSString *const kIosEventName = @"IosEventName";
@implementation IosSDKModule

RCT_EXPORT_MODULE();


+ (id)allocWithZone:(struct _NSZone *)zone {
  static IosSDKModule *sharedInstance = nil;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    sharedInstance = [super allocWithZone:zone];
  });
  return sharedInstance;
}


- (instancetype)init {
  self = [super init];
  if (self) {
    NSNotificationCenter *defaultCenter = [NSNotificationCenter defaultCenter];
    [defaultCenter removeObserver:self];
    [defaultCenter addObserver:self
                      selector:@selector(sendCustomEvent:)
                          name:@"sendCustomEventNotification"
                        object:nil];
  }
  return self;
}


RCT_EXPORT_METHOD(iosDebugInfo:(NSString *)s){
//  NSLog(@"IOS调试输出信息iosDebugInfo: %@", name);
  NSString *msg = [NSString stringWithFormat:@"RN传递过来的字符串：%@", s];
  [self showAlert:msg];
}


//RCT_EXPORT_METHOD(addEventOne:(NSString *)name){
//  NSLog(@"接收传过来的NSString+NSString: %@", name);
//}

//接收来自RN的数据
RCT_EXPORT_METHOD(getDictionaryFromRN:(NSDictionary *)dict){
  NSLog(@"RN接收传过来的dict: %@", dict);
//  let dict = {methodName:data, callback: str,resp:resp};
  NSString *methodName = [dict objectForKey:@"methodName"];
  NSString *callback = [dict objectForKey:@"callback"];
  NSString *resp = [dict objectForKey:@"resp"];
  
//  NSString *rnData=@"{\"wallets\":{\"eos\":[{\"name\":\"chengengping\",\"address\":\"EOS8Af2FhdiVTZVvg2bL43JHaGx8gPzq5aBonXawUoQMzaCVA9jpS\",\"tokens\":{\"eos\":1.0778}}]}}";
  NSLog(@"接收传过来的resp: %@", resp);
  [[NSNotificationCenter defaultCenter] postNotificationName:rnNotification object:self userInfo:@{@"callback":callback,@"resp":resp}];
}





//  - (NSDictionary *)constantsToExport
//  {
//    return @{ @"ValueOne": @"我是从原生定义的~" };
//  }
  //  对外提供调用方法,演示Callback
  RCT_EXPORT_METHOD(testCallbackEventOne:(NSString *)name callback:(RCTResponseSenderBlock)callback)
  {
    NSLog(@"%@",name);
    NSArray *events=@[@"1", @"2", @"3",@"4"]; //准备回调回去的数据
    callback(@[[NSNull null],events]);
  }

//打开DAPPS
RCT_EXPORT_METHOD(openDapps:(NSDictionary *)dict){
  
  NSString *url = [dict objectForKey:@"url"];
  NSString *title = [dict objectForKey:@"title"];
  
  NSLog(@"RN接收传过来的url: %@", url);
  
//  NSString * urlStr = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
  NSURL *urll = [NSURL URLWithString:url];
  dispatch_async(dispatch_get_main_queue(), ^{  // 跳转界面，在主线程进行UI操作
    AppDelegate *delegate = (AppDelegate *)([UIApplication sharedApplication].delegate);
    UINavigationController *rootNav = delegate.navController;
    rootNav.navigationBarHidden = NO;
    DappsViewController *nativeVC = [[DappsViewController alloc] init];
    [nativeVC showDapps:urll title:title];
    [rootNav pushViewController:nativeVC animated:YES];
  });
}

/// 接收通知的方法，接收到通知后发送事件到RN端。RN端接收到事件后可以进行相应的逻辑处理或界面跳转
- (void)sendCustomEvent:(NSNotification *)notification {
  
  NSDictionary *dic = notification.userInfo;
  NSDictionary *dicToRN = [dic objectForKey:@"requestInfo"];
  
  NSLog(@"DAPP-view接收传过来的数据: %@", dicToRN);
  [self sendEventWithName:kIosEventName body:dicToRN];
//  [self sendEventWithName:kIosEventName body:@"这是发给RN的字符串"];
}

/// 重写方法，定义支持的事件集合
- (NSArray<NSString *> *)supportedEvents {
  return @[kIosEventName];
}

/// 重写方法，定义常量
- (NSDictionary *)constantsToExport {
  return @{@"CustomConstant": @"我是iOS端定义的常量"};
}


- (void)showAlert:(NSString *)msg {
  dispatch_async(dispatch_get_main_queue(), ^{
    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"显示结果"
                                                    message:msg
                                                   delegate:nil
                                          cancelButtonTitle:nil
                                          otherButtonTitles:@"确定", nil];
    [alert show];
  });
}
@end
