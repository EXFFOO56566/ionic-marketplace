import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { Post } from './../../data/post';
import { Settings } from './../../data/settings';

@Component({
    selector: 'app-blog',
    templateUrl: './blog.page.html',
    styleUrls: ['./blog.page.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BlogPage implements OnInit {
    id: any;
    comments: any;
    commentFilter: any = {page: 1}
    results: any;
    hasMoreItems: boolean = true;
    constructor(public api: ApiService, public router: Router, public post: Post, public settings: Settings, public route: ActivatedRoute) {}
    ngOnInit() {
        this.id = this.route.snapshot.paramMap.get('id');
        this.getPost();
        this.getComments();
    }
    async getPost() {
        await this.api.getPosts('/wp-json/wp/v2/posts/'+ this.id +'?_embed').then(res => {
            this.post.post = res;
        }, err => {
            console.log(err);
        });
    }
    OnDestroy() {
        this.post.post = {};
    }
    getComments() {
        this.api.getPosts('/wp-json/wp/v2/comments?post='+ this.id + '&page=' + this.commentFilter.page).then(res => {
            this.comments = res;
        }, err => {
            console.log(err);
        });
    }
    async getMoreComments(event) {
        this.commentFilter.page = this.commentFilter.page + 1;
        this.api.getPosts('/wp-json/wp/v2/comments?post='+ this.id + '&page=' + this.commentFilter.page).then(res => {
            this.results = res;
            this.comments.push.apply(this.comments, this.results);
            event.target.complete();
            if (this.results.length == 0) this.hasMoreItems = false;
        }, err => {
            event.target.complete();
        });
    }
}