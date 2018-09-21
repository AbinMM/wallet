//
//  BottomDetailView.h
//  EOSAlert
//
//  Created by Ludi Qiu on 2018/9/20.
//  Copyright © 2018年 Ludi Qiu. All rights reserved.
//

#define kSCREEN_WIDTH  ([UIScreen mainScreen].bounds.size.width)
#define kSCREEN_HEIGHT ([UIScreen mainScreen].bounds.size.height)

#import <UIKit/UIKit.h>
#import "MyButton.h"
NS_ASSUME_NONNULL_BEGIN


@protocol ButtonProtocolDelegate <NSObject>

-(void)cancelButtonClick:(id)sender;

-(void)buttonSubmitClick:(id)sender;

@end



@interface BottomDetailView : UIView<UITableViewDelegate,UITableViewDataSource>{
    
    
}




@property(nonatomic,retain) NSMutableArray * dataArray; //设置中间数据
@property(nonatomic,retain) MyButton * button;
@property(nonatomic,retain) MyButton * cancelButton;

@property(nonatomic,assign) id delegate;

//设置标题
-(void)setTitle:(NSString*)title;


@end

NS_ASSUME_NONNULL_END
