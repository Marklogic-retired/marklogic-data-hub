import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {FacetsComponent} from '../../../components/facets/facets.component';
import {ObjectToArrayPipe} from '../../../../object-to-array.pipe';
import {TruncateCharactersPipe} from '../../../../truncate';
import {ThemeModule} from '../../../components/theme/theme.module';
import {Component, Input} from '@angular/core';

storiesOf('Components|Facets', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
                ThemeModule
            ],
            declarations: [FacetsComponent, StoryCardComponent, ObjectToArrayPipe, TruncateCharactersPipe]
        })
    )
    .add('Facets Component', () => ({
        template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'300px'" [height]="'200px'">
                    <app-facets
                        [facets]="facets"
                        [(activeFacets)]="activeFacets"
                        (activeFacetsChange)="updateFacets($event)"
                    ></app-facets>
                </mlui-story-card>
            </mlui-dhf-theme>
        `,
        props: {
            facets: {
              Collection: {
                facetValues: [
                  {
                    name: "FacetName1",
                    count: 5,
                    value: "FacetValue1"
                  },
                  {
                    name: "FacetName2",
                    count: 2,
                    value: "FacetValue2"
                  },
                  {
                    name: "AnotherFacetLongerName3",
                    count: 1,
                    value: "AnotherFacetLongerValue3"
                  }
                ],
                type: "collection"
              }
            },
            activeFacets: { },
            updateFacets: action('Update Facets')
        },
    }));
