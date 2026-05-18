import { ChangeDetectorRef, Component, ElementRef, Input, OnChanges, OnInit, SimpleChanges, ViewChild } from "@angular/core";
import { Visualization } from "../../shared/enums/visualization";
import { Period } from "../../shared/enums/period";
import { UserInformation } from "../../shared/models/user-information";
import Chart from 'chart.js/auto'
import { Post } from "../../shared/models/post";

@Component({
    selector: 'graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})
export class GraphComponent implements OnInit, OnChanges{
    @Input() visualization!: Visualization;
    @Input() period!: Period;
    @Input() year!: number;
    @Input() month!: number;
    @Input() userInformation!: UserInformation;
    @ViewChild('chart') canvas!: ElementRef;
    chart: any;
    colors: string[] = [
        '#0767ff', '#48ba00', '#ba0048', '#838b8b', '#fdee00', '#87a96b', '#e9d66b', '#4b5320', '#458b74', '#fbceb1',
        '#9966cc', '#e32636', '#8b5a2b', '#f20c00', '#240771', '#e6f200', '#deaa88', '#b0bf1a', '#9fae96', '#458b74',
        '#e52b50', '#00a5ba', '#e0eeee', '#c1cdcd', '#e9d66b', '#b1defb', '#ceb1fb', '#6eafe8', '#71a6d2', '#FF5733',
        '#8D2914'
    ];

    constructor(private changeDetectorRef: ChangeDetectorRef){}

    ngOnInit(): void {
        this.updateChart();
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this.updateChart();
    }

    updateChart(): void{
        let data: any;
        if(this.visualization === Visualization.Messages){
            switch(this.period){
                case Period.Month:
                    data = this.getDataForMessagesChartBasedOnDays();
                    break;
                case Period.Year:
                    data = this.getDataForMessagesChartBasedOnMonths();
                    break;
                default:
                    throw new Error('Period not recognized');
            }
        } else {
            switch(this.period){
                case Period.Month:
                    data = this.getDataForActivityChartBasedOnDays();
                    break;
                case Period.Year:
                    data = this.getDataForActivityChartBasedOnMonths();
                    break;
                default:
                    throw new Error('Period not recognized');
            }
        }

        this.createChart(data);
        this.changeDetectorRef.detectChanges();
    }

    private getDataForMessagesChartBasedOnDays(): any{
        const friends = this.userInformation.friends.map((friend) => friend.username);
        const data: any = {
            labels: friends,
            datasets: []
        };
        const daysInMonth = this.getDaysForMonth(this.month);
        for(let i = 1; i<=daysInMonth; i++){
            const numbersOfMessagesForADay = this.getDataForMessagesChartBasedOnTime(i, true);
            data.datasets.push({
                label: `${i}/${this.month}/${this.year}`,
                data: numbersOfMessagesForADay,
                pointBackgroundColor: this.colors[i],
                backgroundColor: this.colors[i]
            });
        }
        return data;
    }

    private getDataForMessagesChartBasedOnMonths(): any{
        const friends = this.userInformation.friends.map((friend) => friend.username);
        const data: any = {
            labels: friends,
            datasets: []
        };
        for(let i = 1; i<13; i++){
            const numbersOfMessagesForAMonth = this.getDataForMessagesChartBasedOnTime(i, false);
            data.datasets.push({
                label: `${i}/${this.year}`,
                data: numbersOfMessagesForAMonth,
                pointBackgroundColor: this.colors[i],
                backgroundColor: this.colors[i]
            });
        }
        return data;
    }

    private getDataForActivityChartBasedOnDays(): any{
        const data: any = {
            labels: [],
            datasets: []
        };
        const daysInMonth = this.getDaysForMonth(this.month);
        const globalPosts: number[] = [];
        const interactivePosts: number[] = [];
        for(let i = 1; i<=daysInMonth; i++){
            data.labels.push(`${i}/${this.month}/${this.year}`);
            globalPosts.push(this.getNumberOfGlobalPostsForTime(i, true));
            interactivePosts.push(this.getNumberOfInteractivePostsForTime(i, true));
        }
        data.datasets.push({
            label: 'Global',
            data: globalPosts,
            pointBackgroundColor: this.colors[0],
            backgroundColor: this.colors[0]
        });
        data.datasets.push({
            label: 'Interactive',
            data: interactivePosts,
            pointBackgroundColor: this.colors[1],
            backgroundColor: this.colors[1]
        });
        return data;
    }

    private getDataForActivityChartBasedOnMonths(): any{
        const data: any = {
            labels: [],
            datasets: []
        };
        const globalPosts: number[] = [];
        const interactivePosts: number[] = [];
        for(let i = 1; i<13; i++){
            data.labels.push(`${i}/${this.year}`);
            globalPosts.push(this.getNumberOfGlobalPostsForTime(i, false));
            interactivePosts.push(this.getNumberOfInteractivePostsForTime(i, false));
        }
        data.datasets.push({
            label: 'Global',
            data: globalPosts,
            pointBackgroundColor: this.colors[0],
            backgroundColor: this.colors[0]
        });
        data.datasets.push({
            label: 'Interactive',
            data: interactivePosts,
            pointBackgroundColor: this.colors[1],
            backgroundColor: this.colors[1]
        });
        return data;
    }

    private getDataForMessagesChartBasedOnTime(time: number, day: boolean): number[]{
        const numbersOfMessages: number[] = [];
        this.userInformation.friends.forEach((friend) => {
            const messagesWithFriend = this.userInformation.messages.find((conversation) => conversation.friend_id === friend.id)?.messages;
            const numberOfMessagesWithFriendForTime = messagesWithFriend?.filter((message) => {
                const messageTime = new Date(message.timestamp);
                if(day){
                    return messageTime.getDate() === time && messageTime.getMonth() === this.month && messageTime.getFullYear() === this.year;
                } else {
                    return messageTime.getMonth() === time && messageTime.getFullYear() === this.year;
                }
            })?.length ?? 0;
            numbersOfMessages.push(numberOfMessagesWithFriendForTime);
        });
        return numbersOfMessages;
    }

    private getNumberOfGlobalPostsForTime(time: number, day: boolean): number{
        return this.getPostsForTime(time, day).filter((post) => post.to === null).length;
    }

    private getNumberOfInteractivePostsForTime(time: number, day: boolean): number{
        return this.getPostsForTime(time, day).filter((post) => post.to !== null).length;
    }

    private getPostsForTime(time: number, day: boolean): Post[]{
        return this.userInformation.posts.filter((post) => {
            const postTime = new Date(post.timestamp);
            if(day){
                return postTime.getDate() === time && postTime.getMonth() === this.month && postTime.getFullYear() === this.year;
            } else{
                return postTime.getMonth() === time && postTime.getFullYear() === this.year;
            }
        });
    }

    private getDaysForMonth(month: number): number{
        const days = new Date(this.year, month, 0).getDate();
        return days;
    }

    private createChart(data: any): void{
        const chart = Chart.getChart("MyChart");
        if(chart != null){
            chart.destroy();
        }
        
        this.chart = new Chart("MyChart", {
          type: 'radar',
          data,
          options: {
            aspectRatio: 0.1,
            scales: {
              r: {
                angleLines: {
                  color: 'rgba(0, 0, 0, 0.1)', 
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)', 
                },
                pointLabels: {
                  color: 'rgba(0, 0, 0, 0.8)', 
                }
              }
            },
          }
        });
        this.chart.width = window.innerWidth;
        this.chart.height = window.innerHeight;
    }
}