import { NgModule } from '@angular/core';
import { SearchPipe } from './search/search';
import { ManageSearchPipe } from './search/search-manage';
import { SearchHomePipe } from './search/search-home';
import { SortByPipe } from './search/sort-pipe';
import { SortAlertByPipe } from './search/sort-alert-pipe';
import { SortHomeByPipe } from './search/sort-home-pipe';
@NgModule({
	declarations: [SearchPipe, ManageSearchPipe, SearchHomePipe, SortByPipe, SortAlertByPipe, SortHomeByPipe],
	imports: [],
	exports: [SearchPipe, ManageSearchPipe, SearchHomePipe, SortByPipe, SortAlertByPipe, SortHomeByPipe]
})
export class PipesModule { }
