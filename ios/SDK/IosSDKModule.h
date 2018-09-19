//
//  IosSDKModule.h
//  eostoken
//
//  Created by xyg on 11/9/18.
//  Copyright © 2018年 Facebook. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTLog.h>
#import <WebKit/WebKit.h>
#import <UIKit/UIKit.h>

//@interface IosSDKModule : NSObject<RCTBridgeModule>
@interface IosSDKModule : RCTEventEmitter<RCTBridgeModule>
@end

