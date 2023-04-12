import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Post } from './../../data/post';
import { Settings } from './../../data/settings';

@Component({
    selector: 'app-blogs',
    templateUrl: './blogs.page.html',
    styleUrls: ['./blogs.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BlogsPage implements OnInit {
    posts: any;
    filter: any = {};
    results: any;
    hasMoreItems: boolean = true;
    constructor(public api: ApiService, public router: Router, public post: Post, public settings: Settings, public navCtrl: NavController) {
        this.filter.page = 1;
    }
    ngOnInit() {
        this.getPosts();
    }
    async getPosts() {
        await this.api.getPosts('/wp-json/wp/v2/posts?_embed&per_page=10&page=' + this.filter.page).then(res => {
            if(res)
            this.posts = res;
            else this.posts.posts = [];
        }, err => {
            console.log(err);
        });
    }
    async loadData(event) {
        this.filter.page = this.filter.page + 1;
        await this.api.getPosts('/wp-json/wp/v2/posts?_embed&per_page=10&page=' + this.filter.page).then(res => {
            if(res) {
               this.results = res;
                this.posts.push.apply(this.posts, this.results);
                event.target.complete(); 
            } else this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
    getDetail(post) {
        this.post.post = post;
        this.navCtrl.navigateForward('/tabs/account/blogs/blog/' + post.id);
    }
}