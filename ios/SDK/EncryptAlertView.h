//
//  EncryptAlertView.h
//  EncryptAlertView
//
//  Created by qiuludi on 2018/09/20.
//  Copyright © 2018年 qiuludi. All rights reserved.
//

#import <UIKit/UIKit.h>


typedef void (^CancleButtonClick)();
typedef void (^SureButtonClick)(NSString* str);


@interface EncryptAlertView : UIView

@property (nonatomic, copy) CancleButtonClick cancleBlock;
@property (nonatomic, copy) SureButtonClick sureBlock;


-(instancetype)initWithFrame:(CGRect)frame withTitle:(NSString *)title alertMessage:(NSString *)msg confrimBolck:(void (^)())confrimBlock cancelBlock:(void (^)())cancelBlock;
//弹出
-(void)show;

//隐藏
-(void)hide;


@end
