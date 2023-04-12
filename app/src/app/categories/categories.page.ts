import { Component, ChangeDetectorRef } from '@angular/core';
import { LoadingController, NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../api.service';
import { Data } from '../data';
import { Settings } from '../data/settings';

@Component({
    selector: 'app-categories',
    templateUrl: 'categories.page.html',
    styleUrls: ['categories.page.scss']
})
export class CategoriesPage {
    selectedCategory: any = {};
    constructor(public changeDetectorRef: ChangeDetectorRef, public api: ApiService, public data: Data, public loadingController: LoadingController, public navCtrl: NavController, public router: Router, public settings: Settings, public route: ActivatedRoute) {}
    getProducts(id) {
        this.navCtrl.navigateForward('/tabs/categories/products/' + id);
    }
    subCategories(id){
	  return this.data.categories.filter(item => item.parent == id);
	}
  	showSubCategory(i){
	  	let intial = this.data.mainCategories[i].show;
	  	this.data.mainCategories[i].show = !intial;
        if(this.data.categories.filter(item => item.parent == this.data.mainCategories[i].id).length == 0) {
            this.data.mainCategories.forEach(item => item.show = false);
            this.getProducts(this.data.mainCategories[i].id);
        }
  	}
    selectcategory(item) {
        this.selectedCategory = item;
    }
    ngAfterViewInit() {
        this.selectedCategory = this.data.mainCategories[0];
        this.changeDetectorRef.detectChanges();
    }
}