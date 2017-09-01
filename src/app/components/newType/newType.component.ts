import { DataSource } from '@angular/cdk';
import {
  Component,
  Injectable,
  Input
} from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

import { SharedService } from '../../parentchild.service';
import { NewTypeService } from './newType.service';

export interface ProductType {
  id: number;
  name: string;
}

@Component({
  selector: 'newType',
  templateUrl: './newType.component.html',
  styleUrls: [ './newType.component.css' ],
  providers: [
    NewTypeService
  ]
})
@Injectable()
export class NewTypeComponent {

  dataTypeEnum = DataType;
  dataTypeInput: Array<any> = [];
  propertyList: PropertyDataSource | null;
  displayedColumns: Array<string> = [ 'name', 'type', 'isRequired', 'actions' ];

  name: string = "";
  properties: PropertyList =  new PropertyList();
  response: any;

  constructor(private _service: NewTypeService, private _sharedService: SharedService) {
    var dataTypeKeys = Object.keys(DataType);
    dataTypeKeys.slice(dataTypeKeys.length / 2).forEach((val, key) => {
      this.dataTypeInput.push({
        id: key,
        name: val
      });
    });
  }

  ngOnInit() {
    this.propertyList = new PropertyDataSource(this.properties);
  }

  submit(): void {
    var params = {
      name: this.name,
      properties: this.properties.data
    }

    this._service.sendNewType(params).subscribe((data: any) => {
      this.response = data;
      this._sharedService.emit<ProductType>("newType", data.body.newType);
    })
  }

}

export enum DataType {
  String,
  Integer,
  Boolean
}
interface Property {
  id: number;
  name: string;
  type: DataType;
  isRequired: boolean;
}

class PropertyList {

  dataList: BehaviorSubject<Property[]> = new BehaviorSubject<Property[]>([]);

  get data(): Property[] {
    return this.dataList.value;
  }

  addProperty(): void {
    let clone = this.data.slice();
    clone.push({
      id: this._getLastId() + 1,
      name: '',
      type: DataType.String,
      isRequired: false
    });
    this.dataList.next(clone);
  }

  removeProperty(id: number): void {
    this.dataList.next(this.data.filter((obj) => {
      return obj.id != id;
    }))
  }

  private _getLastId(): number {
    let last = this.data.slice(-1)[0];
    if(last)
      return last.id;
    return 0;
  }

}

class PropertyDataSource extends DataSource<any> {

  constructor(private _propertyList: PropertyList) {
    super();
  }

  connect(): Observable<Property[]> {
    return this._propertyList.dataList;
  }

  disconnect() { }

}
