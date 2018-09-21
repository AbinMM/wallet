//
//  BottomDetailView.m
//  EOSAlert
//
//  Created by Ludi Qiu on 2018/9/20.
//  Copyright © 2018年 Ludi Qiu. All rights reserved.
//

#import "BottomDetailView.h"


@implementation BottomDetailView

/*
// Only override drawRect: if you perform custom drawing.
// An empty implementation adversely affects performance during animation.
- (void)drawRect:(CGRect)rect {
    // Drawing code
}
*/

-(id)initWithFrame:(CGRect)frame{
    self = [super initWithFrame:frame];
    
    float width = 80;
    CGRect rect = CGRectMake((kSCREEN_WIDTH - width)/2, 15, 100, 30);
    
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


//sendParam:(NSDictionary *)dictParam
-(void)setDataArray:(NSMutableArray *)dataArray {
    
    float left = 15;
    float y = 35;
    float width = 110;
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
        labelTitle.font            = [UIFont systemFontOfSize:20];
        labelTitle.textAlignment   = NSTextAlignmentLeft;
        [self addSubview:labelTitle];
        
        labelTitle.frame = CGRectMake(left, y, width, height);
        
        labelTitle.text = title;
        
        UILabel *labelContent = [[UILabel alloc] init];
        labelContent.backgroundColor = [UIColor clearColor];
        labelContent.textColor       = [UIColor colorWithRed:0 green:0 blue:0 alpha:1];
        labelContent.font            = [UIFont systemFontOfSize:20];
        labelContent.textAlignment   = NSTextAlignmentLeft;
        labelContent.numberOfLines   = 0;
        labelContent.preferredMaxLayoutWidth = [UIScreen mainScreen].bounds.size.width-104;
        [self addSubview:labelContent];
        labelContent.frame = CGRectMake(left + width + left, y, width, height);

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
    
    self.button = [[MyButton alloc] initWithFrame:CGRectMake(left , y, self.frame.size.width - 2* left, 40) ];
    self.button.paramDic = paramDic;
    self.button.layer.masksToBounds = YES;
//    self.button.layer.cornerRadius  = 2;
    [self.button setTitle:@"确认支付" forState:UIControlStateNormal];
    
    [self.button setBackgroundColor:[UIColor colorWithRed:58/255.0 green:153/255.0 blue:216/255.0 alpha:1] ];
    [self.button addTarget:self action:@selector(buttonClick:) forControlEvents:UIControlEventTouchUpInside];
    [self addSubview:self.button];
    self.button.tag = 12;
    y += 40;

}

-(void)buttonClick:(id)sender{
    MyButton * button = (MyButton * )sender;
    NSLog(@"button:%@",button.paramDic);
    if (button.tag == 11) {
        if ([self.delegate respondsToSelector:@selector(cancelButtonClick:)]) {
            [_delegate cancelButtonClick:self];
        }
    }
    else if (button.tag == 12){
        if ([self.delegate respondsToSelector:@selector(buttonSubmitClick:)]) {
            [_delegate buttonSubmitClick:button];
        }
    }
   
    
}



#pragma mark - UITableViewDataSource
//- (NSInteger)numberOfSectionsInTableView:(UITableView *)tableView{
//
////    NSInteger row = [self.orderListModel.orderList count];
//    NSInteger row = 5;
//
//    return row;
//}
//
//-(NSInteger)tableView:(UITableView *)tableView numberOfRowsInSection:(NSInteger)section{
//
//    NSInteger row = 1;
//    return row;
//}
//
//- (UITableViewCell *)tableView:(UITableView *)tableView cellForRowAtIndexPath:(NSIndexPath *)indexPath{
//
//
//    static NSString *identifier1 = @"orderListCell";
//    static NSString *MyIdentifier = @"MyIdentifier";
//
//    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:MyIdentifier];
//
//    if (cell == nil) {
//        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:MyIdentifier]
//                ;
//    }
//    return cell;
//}

//#pragma mark - UITableViewDeleate
//- (void)tableView:(UITableView *)tableView didSelectRowAtIndexPath:(NSIndexPath *)indexPath
//{
//
////    NSInteger index = indexPath.section;
//    static NSString *MyIdentifier = @"MyIdentifier";
//
//    UITableViewCell *cell = [tableView dequeueReusableCellWithIdentifier:MyIdentifier];
//
//    if (cell == nil) {
//        cell = [[UITableViewCell alloc] initWithStyle:UITableViewCellStyleDefault reuseIdentifier:MyIdentifier];
//    }
//    return cell;
//}
//
//- (CGFloat)tableView:(UITableView *)tableView heightForRowAtIndexPath:(NSIndexPath *)indexPath
//{
//    CGFloat height = 0.0;
//
//
//    UITableViewCell *cell = [self tableView:self.tableVIewShow cellForRowAtIndexPath:indexPath];
//    height = [cell.contentView systemLayoutSizeFittingSize:UILayoutFittingCompressedSize].height;
//
//    return height;
//}
//
//- (CGFloat)tableView:(UITableView *)tableView heightForFooterInSection:(NSInteger)section
//{
//    CGFloat height = 10;
//    return height;
//}
//
//
//- (CGFloat)tableView:(UITableView *)tableView heightForHeaderInSection:(NSInteger)section
//{
//    CGFloat height = 0;
//    if (section == 0) {
//        height = 10;
//    }
//    return height;
//}
//
//- (UIView *)tableView:(UITableView *)tableView viewForFooterInSection:(NSInteger)section
//{
//    UIView *aView = [[UIView alloc] init];
//    aView.backgroundColor = [UIColor clearColor];
//    return aView;
//}
//
//- (UIView *)tableView:(UITableView *)tableView viewForHeaderInSection:(NSInteger)section
//{
//    UIView *aView = [[UIView alloc] init];
//    aView.backgroundColor = [UIColor clearColor];
//    return aView;
//}


@end
