//
//  YCAlertView.m
//  YCAlertView
//
//  Created by qiuludi on 2018/09/20.
//  Copyright © 2017年 qiuludi. All rights reserved.
//

#import "EncryptAlertView.h"
#define TagValue  1000
#define AlertTime 0.3 //弹出动画时间
#define DropTime 0.5 //落下动画时间




@interface EncryptAlertView()

@property(nonatomic,strong)UILabel *titleLB;
@property(nonatomic,strong)UITextField *textFieldTF;
@property(nonatomic,strong)UIButton *cancleBtn;
@property(nonatomic,strong)UIButton *sureBtn;

@end

@implementation EncryptAlertView


-(instancetype)initWithFrame:(CGRect)frame withTitle:(NSString *)title alertMessage:(NSString *)msg confrimBolck:(void (^)())confrimBlock cancelBlock:(void (^)())cancelBlock{
    if (self = [super initWithFrame:frame]) {
        [self customUIwith:frame title:title message:msg];
        _sureBlock = confrimBlock;
        _cancleBlock = cancelBlock;
    }
    return self;
}


-(void)customUIwith:(CGRect)frame title:(NSString *)title message:(NSString *)msg{
    UIImageView *bgimageview = [[UIImageView alloc] initWithFrame:CGRectMake(0, 0, frame.size.width, frame.size.height)];
    bgimageview.backgroundColor = [UIColor whiteColor];
//    bgimageview.image = [UIImage imageNamed:@""];
    
    [self addSubview:bgimageview];
    
    self.layer.masksToBounds = YES;
    self.layer.cornerRadius = 5;
    
    _titleLB = [[UILabel alloc] initWithFrame:CGRectMake(30, 15, 190, 25)];
    _titleLB.textColor = [UIColor blackColor];
    _titleLB.textAlignment = NSTextAlignmentCenter;
    _titleLB.font = [UIFont systemFontOfSize:20];
    [self addSubview:_titleLB];
    
    _textFieldTF = [[UITextField alloc] initWithFrame:CGRectMake(20, 45, self.frame.size.width - 40, 30)];
    _textFieldTF.returnKeyType = UIReturnKeySearch; //设置按键类型
    _textFieldTF.enablesReturnKeyAutomatically = YES; //这里设置为无文字就灰色不可点
    _textFieldTF.placeholder = @"请输入密码";
    _textFieldTF.secureTextEntry = YES;
    _textFieldTF.contentVerticalAlignment = UIControlContentVerticalAlignmentCenter;
    _textFieldTF.textAlignment = NSTextAlignmentCenter;
    [self addSubview:_textFieldTF];
    
    UIColor * _lineColor = [UIColor lightGrayColor];
    UIView *viewLine = [[UIView alloc] init];
    viewLine.userInteractionEnabled = NO;
    [self addSubview:viewLine];
    
    viewLine.backgroundColor = _lineColor;
    viewLine.frame  = CGRectMake(10, 45 + 30+ 10, self.frame.size.width - 2* 10, 1);
    
    
    _cancleBtn = [UIButton buttonWithType:UIButtonTypeCustom];
//  [_cancleBtn setBackgroundColor:[UIColor colorWithRed: 107/255.0 green:202/255.0 blue:253/255.0 alpha:1]];
    [_cancleBtn setBackgroundColor:[UIColor colorWithRed: 253/255.0 green:103/255.0 blue:105/255.0 alpha:1]];
    [_cancleBtn setTitle:@"取消" forState:UIControlStateNormal];
    [_cancleBtn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    
    _cancleBtn.frame = CGRectMake(20, 100, self.frame.size.width/2 - 20-10, 40);
    [self addSubview:_cancleBtn];
    [_cancleBtn addTarget:self action:@selector(cancleBtnClick) forControlEvents:UIControlEventTouchUpInside];
    
    
    _sureBtn = [UIButton buttonWithType:UIButtonTypeCustom];
//  [_sureBtn setBackgroundColor:[UIColor colorWithRed: 253/255.0 green:103/255.0 blue:105/255.0 alpha:1]];
    [_sureBtn setBackgroundColor:[UIColor colorWithRed: 107/255.0 green:202/255.0 blue:253/255.0 alpha:1]];
    [_sureBtn setTitle:@"确认" forState:UIControlStateNormal];
    [_sureBtn setTitleColor:[UIColor whiteColor] forState:UIControlStateNormal];
    _sureBtn.frame = CGRectMake(self.frame.size.width/2 + 10, 100, self.frame.size.width/2 - 20-10, 40);
    [self addSubview:_sureBtn];
    [_sureBtn addTarget:self action:@selector(sureBtnClick) forControlEvents:UIControlEventTouchUpInside];

    _titleLB.text = title;
    
}

-(void)cancleBtnClick{
    [self hide];
    if (_cancleBlock) {
        _cancleBlock();
    }
}
-(void)sureBtnClick{
    [self hide];
    if (_sureBlock) {
        _sureBlock(_textFieldTF.text);
    }
}


-(void)show{
    if (self.superview) {
        [self removeFromSuperview];
    }
    UIView *oldView = [[UIApplication sharedApplication].keyWindow viewWithTag:TagValue];
    if (oldView) {
        [oldView removeFromSuperview];
    }
    UIView *iview = [[UIView alloc] initWithFrame:[UIApplication sharedApplication].keyWindow.bounds];
    iview.tag = TagValue;
    iview.userInteractionEnabled = YES;
//    UITapGestureRecognizer *tap = [[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(hide)];
//    [iview addGestureRecognizer:tap];
    iview.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.6];
    [[UIApplication sharedApplication].keyWindow addSubview:iview];
    [[UIApplication sharedApplication].keyWindow addSubview:self];
    self.center = [UIApplication sharedApplication].keyWindow.center;
    self.alpha = 0;
    self.transform = CGAffineTransformScale(self.transform,0.1,0.1);
    [UIView animateWithDuration:AlertTime animations:^{
        self.transform = CGAffineTransformIdentity;
        self.alpha = 1;
    }];
}


//弹出隐藏
-(void)hide{
    if (self.superview) {
        [UIView animateWithDuration:AlertTime animations:^{
            self.transform = CGAffineTransformScale(self.transform,0.1,0.1);
            self.alpha = 0;
        } completion:^(BOOL finished) {
            UIView *bgview = [[UIApplication sharedApplication].keyWindow viewWithTag:TagValue];
            if (bgview) {
                [bgview removeFromSuperview];
            }
            [self removeFromSuperview];
        }];
    }
}

@end
