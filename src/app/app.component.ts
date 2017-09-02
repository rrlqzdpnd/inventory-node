import { Component, OnDestroy } from '@angular/core';
import { SharedService } from './parentchild.service';

import { AppService } from './app.service';
import { ProductType } from './components/newType/newType.component';
import { IEventListener } from './parentchild.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [ AppService ]
})
export class AppComponent implements OnDestroy {

  private _newTypeListener: IEventListener;
  sidebar: Array<ProductType> = [];

  constructor(private _service: AppService, private _sharedService: SharedService) {
    this._newTypeListener = this._sharedService.listen<ProductType>("newType", (data) => {
      this.sidebar.push(data);
    });
  }

  ngOnInit() {
    // this._service.getSidebar().subscribe((data: any) => {
    //   this.sidebar = data.body.products;
    // });
  }

  ngOnDestroy() {
    this._newTypeListener.ignore();
  }

}
