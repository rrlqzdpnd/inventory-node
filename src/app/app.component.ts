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

  sidebar: ProductType[] = [];
  private _newTypeListener: IEventListener;

  constructor(private _service: AppService, private _sharedService: SharedService) {
    this._newTypeListener = _sharedService.listen<ProductType>("newType", (data) => {
      console.log(data);
      this._service.getSidebar().subscribe((data) => {
        console.log(data);
      });
    });
  }

  ngOnDestroy() {
    this._newTypeListener.ignore();
  }

}
