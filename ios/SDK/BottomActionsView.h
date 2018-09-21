//
//  BottomActionsView.h
//  EOSAlert
//
//  Created by Ludi Qiu on 2018/9/20.
//  Copyright © 2018年 Ludi Qiu. All rights reserved.
//

#import <UIKit/UIKit.h>
#import "MyButton.h"
#define kSCREEN_WIDTH  ([UIScreen mainScreen].bounds.size.width)
#define kSCREEN_HEIGHT ([UIScreen mainScreen].bounds.size.height)


NS_ASSUME_NONNULL_BEGIN


@protocol ActionsButtonProtocolDelegate <NSObject>

-(void)cancelActionsButtonClick:(id)sender;

-(void)buttonActionsSubmitClick:(id)sender;

@end

@interface BottomActionsView : UIView

//设置标题
-(void)setTitle:(NSString*)title;

@property(nonatomic,retain) NSMutableArray * dataArray; //设置中间数据
@property(nonatomic,retain) UILabel * lastLabelTitle;
@property(nonatomic,retain) MyButton * showHideBotton;
@property(nonatomic,retain) UILabel * lastLabelContent;


//-(void)setBottonTitle:(NSString*)title; //
//-(void)setBottonShowHideContent:(NSString*)text;



@property(nonatomic,retain) MyButton * button; //确定按钮
@property(nonatomic,retain) MyButton * cancelButton;//右上角取消按钮

@property(nonatomic,assign) id delegate;

@end

NS_ASSUME_NONNULL_END
