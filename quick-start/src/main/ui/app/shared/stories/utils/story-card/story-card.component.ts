import {Component, Input, ViewChild, ElementRef} from '@angular/core';

@Component({
    selector: 'mlui-story-card',
    template: `
        <div class="container">
            <div class="card story-card" #card>
                <ng-content></ng-content>
            </div>
        </div>
    `,
    styles: [`
        .story-card {
            background: white;
            padding: 10px 10px 10px 10px;
            box-shadow: 10px 10px 20px;
        }
    `]
})
export class StoryCardComponent {
    @ViewChild('card') card: ElementRef;
    @Input() width = '100px';
    @Input() height = '100px';

    constructor() {}

    ngAfterViewInit() {
        this.card.nativeElement.style.width = this.width;
        this.card.nativeElement.style.height = this.height;
    }

}
