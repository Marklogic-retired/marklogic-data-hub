import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {NewEntityComponent} from '../../../components/new-entity/new-entity.component';
import {ThemeModule} from '../../../components/theme/theme.module';
import {MdlDialogComponent} from '@angular-mdl/core';

storiesOf('Components|New Entity', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
                ThemeModule
            ],
            declarations: [NewEntityComponent, StoryCardComponent],
            providers: [MdlDialogComponent]
        })
    )
    .add('New Entity Component', () => ({
        template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="500" [height]="150">
                <app-new-entity></app-new-entity>
              </mlui-story-card>
            </mlui-dhf-theme>
        `,
        props: {

        },
    }));
