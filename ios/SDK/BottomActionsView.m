//
//  BottomActionsView.m
//  EOSAlert
//
//  Created by Ludi Qiu on 2018/9/20.
//  Copyright © 2018年 Ludi Qiu. All rights reserved.
//

#import "BottomActionsView.h"

@interface BottomActionsView()<UITextViewDelegate>{
    BOOL showActions;
    float oldframeY;
    float resetHeight;//显示隐藏的高度差
    
}

@end

@implementation BottomActionsView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/


-(id)initWithFrame:(CGRect)frame{
    self = [super initWithFrame:frame];
    
    
    showActions = NO;
    
    float width = 80;
    CGRect rect = CGRectMake((kSCREEN_WIDTH - width)/2, 7, 100, 30);
    
    UILabel * titleLabel = [[UILabel alloc] initWithFrame:rect];
    [self addSubview:titleLabel];
    titleLabel.text = @"订单详情";
    titleLabel.font            = [UIFont systemFontOfSize:22];
    
  
    self.cancelButton = [[MyButton alloc] initWithFrame:CGRectMake(kSCREEN_WIDTH - 10 - 30 , 10, 20, 20) ];
    
    self.cancelButton.layer.masksToBounds = YES;
    //    self.button.layer.cornerRadius  = 2;
    [self.cancelButton setBackgroundImage:[UIImage imageNamed:@"UMS_shake_close"] forState:UIControlStateNormal ];
    [self.cancelButton addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.cancelButton];
    self.cancelButton.tag = 11;
    
    
    
    return self;
}

-(void)setTitle:(NSString*)title{
    
}



-(void)setDataArray:(NSMutableArray *)dataArray{
    
    float left = 15;
    float y = 35;
    float width = 130;
    float height = 30;
  
    NSDictionary *paramDic = dataArray[0];
    NSInteger count = [dataArray count];
    for (int i = 1; i < count; i++) {
        
        NSDictionary *dict = dataArray[i];
        NSString *title    = dict[@"title"];
        NSString *content  = dict[@"content"];
        
        UILabel *labelTitle = [[UILabel alloc] init];
        labelTitle.backgroundColor = [UIColor clearColor];
        labelTitle.textColor       = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
        labelTitle.font            = [UIFont systemFontOfSize:18];
        labelTitle.textAlignment   = NSTextAlignmentLeft;
        [self addSubview:labelTitle];
        
        labelTitle.frame = CGRectMake(left, y, width, height);
        
        labelTitle.text = title;
        
        UILabel *labelContent = [[UILabel alloc] init];
        labelContent.backgroundColor = [UIColor clearColor];
        labelContent.textColor       = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
        labelContent.font            = [UIFont systemFontOfSize:18];
        labelContent.textAlignment   = NSTextAlignmentLeft;
        labelContent.numberOfLines   = 0;
        labelContent.preferredMaxLayoutWidth = [UIScreen mainScreen].bounds.size.width-104;
        [self addSubview:labelContent];
        labelContent.frame = CGRectMake(width, y, width+30, height);
        
        labelContent.text = content;
        
        y += 32;
        
        UIColor * _lineColor = [UIColor lightGrayColor];
        
        
        UIView *viewLine = [[UIView alloc] init];
        viewLine.userInteractionEnabled = NO;
        [self addSubview:viewLine];
        
        viewLine.backgroundColor = _lineColor;
        viewLine.frame  = CGRectMake(left, y, self.frame.size.width - 2* left, 1);
        
        y += 1;
        
    }
    
    
    
    UILabel *labelTitle = [[UILabel alloc] init];
    labelTitle.backgroundColor = [UIColor clearColor];
    labelTitle.textColor       = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
    labelTitle.font            = [UIFont systemFontOfSize:18];
    labelTitle.textAlignment   = NSTextAlignmentLeft;
    [self addSubview:labelTitle];
    
    self.lastLabelTitle = labelTitle;
    
    labelTitle.frame = CGRectMake(left, y, width * 2, height);
    
    self.showHideBotton = [[MyButton alloc] initWithFrame:CGRectMake(self.frame.size.width -  width, y, width, height) ];
    
    self.showHideBotton.layer.masksToBounds = YES;
    //    self.button.layer.cornerRadius  = 2;
    [self.showHideBotton setTitle:@"Actions详情" forState:UIControlStateNormal];
    [self.showHideBotton setTitleColor:[UIColor colorWithRed:58/255.0 green:153/255.0 blue:216/255.0 alpha:1] forState:UIControlStateNormal];
    self.showHideBotton.tag = 13;

//    [self.showHideBotton setBackgroundColor:[UIColor colorWithRed:58/255.0 green:153/255.0 blue:216/255.0 alpha:1] ];
    [self.showHideBotton addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.showHideBotton];
    
    y += 32;
    
    
  //    self.lastLabelContent = [[UILabel alloc] init];
  //    self.lastLabelContent.backgroundColor = [UIColor clearColor];
  //    self.lastLabelContent.textColor       = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
  //    self.lastLabelContent.font            = [UIFont systemFontOfSize:18];
  //    self.lastLabelContent.textAlignment   = NSTextAlignmentLeft;
  //    [self addSubview:self.lastLabelContent];
  //    self.lastLabelContent.numberOfLines = 0;
  //    self.lastLabelContent.lineBreakMode = NSLineBreakByWordWrapping;
  
  
  self.lastLabelContent=[[UITextView alloc]init];
  [self.lastLabelContent setTextColor:[UIColor colorWithRed:0 green:0 blue:0 alpha:1]];
  [self.lastLabelContent setBackgroundColor:[UIColor clearColor]];
  [self.lastLabelContent.layer setBorderColor:[[UIColor clearColor] CGColor]];
  [self.lastLabelContent setFont:[UIFont systemFontOfSize:12]];
  [self.lastLabelContent.layer setBorderWidth:1.0f];
  [self.lastLabelContent setDelegate:self];
  [self addSubview:self.lastLabelContent];
  CGSize size = [self.lastLabelContent sizeThatFits:CGSizeMake(kSCREEN_WIDTH -20, MAXFLOAT)];//根据文字的长度返回一个最佳宽度和高度
  self.lastLabelContent.frame = CGRectMake(10, y, kSCREEN_WIDTH -20, size.height);//假如是自适应高度的话，就把宽度确定
  //    y += size.height;
  
  y += 10;//间隔为10
    
    self.button = [[MyButton alloc] initWithFrame:CGRectMake(left , y, self.frame.size.width - 2* left, 40) ];
    self.button.paramDic = paramDic;
    self.button.layer.masksToBounds = YES;
    //    self.button.layer.cornerRadius  = 2;
    [self.button setTitle:@"确定" forState:UIControlStateNormal];
    
    [self.button setBackgroundColor:[UIColor colorWithRed:58/255.0 green:153/255.0 blue:216/255.0 alpha:1] ];
    [self.button addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.button];
    self.button.tag = 12;
    y += 40;
    
}


-(void)setBottonTitle:(NSString*)title{
    
    
}

-(void)setBottonShowHideContent:(NSString*)text{
    
    
}

-(void)buttonClick:(id)sender{
    MyButton * button = (MyButton * )sender;
    NSLog(@"button:%@",button.paramDic);
    if (button.tag == 11) {
        if ([self.delegate respondsToSelector:@selector(cancelActionsButtonClick:)]) {
            [_delegate cancelActionsButtonClick:self];
        }
    }
    else if (button.tag == 12){
        if ([self.delegate respondsToSelector:@selector(buttonActionsSubmitClick:)]) {
            [_delegate buttonActionsSubmitClick:button];
        }
    }
    else if (button.tag == 13){
        
        if (showActions == NO) {
            showActions = YES;
            
          CGFloat maxHeight = kSCREEN_HEIGHT * 1/2;
          
          CGRect oldrect = self.lastLabelContent.frame;
          
          CGSize size = [self.lastLabelContent sizeThatFits:CGSizeMake(kSCREEN_WIDTH -20, MAXFLOAT)];//根据文字的长度返回一个最佳宽度和高度
          if (size.height<= maxHeight) {
            self.lastLabelContent.scrollEnabled = NO;    // 不允许滚动
            
          }else{
            if (size.height >= maxHeight)
            {
              size.height = maxHeight;
              self.lastLabelContent.scrollEnabled = YES;   // 允许滚动
            }
            else
            {
              self.lastLabelContent.scrollEnabled = NO;    // 不允许滚动
            }
          }
          
          
          self.lastLabelContent.frame = CGRectMake(oldrect.origin.x, oldrect.origin.y, kSCREEN_WIDTH -20, size.height);//假如是自适应高度的话，就把宽度确定
            
            CGRect tmpFrame = self.button.frame;  // 1.取出原来的属性
            tmpFrame.origin.y = self.lastLabelContent.frame.origin.y+size.height+10;
            self.button.frame = tmpFrame;
            resetHeight = size.height;
            
            //将控件变高
            tmpFrame = self.frame;
            tmpFrame.origin.y = tmpFrame.origin.y - size.height;
            tmpFrame.size.height = tmpFrame.size.height + resetHeight;
            self.frame = tmpFrame;
            
        }
        else{
         
            showActions = NO;
            CGRect oldrect = self.lastLabelContent.frame;
            self.lastLabelContent.frame = CGRectMake(oldrect.origin.x, oldrect.origin.y, 0, 0);;
            
            CGRect tmpFrame = self.button.frame;  // 1.取出原来的属性
            tmpFrame.origin.y = self.lastLabelContent.frame.origin.y+self.lastLabelContent.frame.size.height+10;
            
            self.button.frame = tmpFrame;
            
            //将整个控件恢复原状
            tmpFrame = self.frame;
            tmpFrame.origin.y = tmpFrame.origin.y + resetHeight;
            self.frame = tmpFrame;
            
        }

        
        
    }
    
}


@end
