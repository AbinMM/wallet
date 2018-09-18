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

@implementation IosSDKModule


RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(addEventOne:(NSString *)name){
  NSLog(@"接收传过来的NSString+NSString: %@", name);
}

  - (NSDictionary *)constantsToExport
  {
    return @{ @"ValueOne": @"我是从原生定义的~" };
  }
  //  对外提供调用方法,演示Callback
  RCT_EXPORT_METHOD(testCallbackEventOne:(NSString *)name callback:(RCTResponseSenderBlock)callback)
  {
    NSLog(@"%@",name);
    NSArray *events=@[@"1", @"2", @"3",@"4"]; //准备回调回去的数据
    callback(@[[NSNull null],events]);
  }

  RCT_EXPORT_METHOD(openUrl:(NSString *)url){
    NSLog(@"RN接收传过来的url: %@", url);
    NSString * urlStr = [url stringByAddingPercentEscapesUsingEncoding:NSUTF8StringEncoding];
    NSURL *urll = [NSURL URLWithString:urlStr];
    dispatch_async(dispatch_get_main_queue(), ^{
      AppDelegate *delegate = (AppDelegate *)([UIApplication sharedApplication].delegate);
      UINavigationController *rootNav = delegate.navController;
      rootNav.navigationBarHidden = NO;
      DappsViewController *nativeVC = [[DappsViewController alloc] init];
      [nativeVC showDapps:urll];
      [rootNav pushViewController:nativeVC animated:YES];
    });
  

  
}





@end
