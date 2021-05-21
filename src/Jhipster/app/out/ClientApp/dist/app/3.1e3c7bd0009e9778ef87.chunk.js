(window.webpackJsonp=window.webpackJsonp||[]).push([[3],{103:function(c,t,n){n.d(t,"a",(function(){return r}));var e=n(13);const r=c=>{let t=new e.d;return c&&(Object.keys(c).forEach(n=>{"sort"!==n&&(t=t.set(n,c[n]))}),c.sort&&c.sort.forEach(c=>{t=t.append("sort",c)})),t}},106:function(c,t,n){n.d(t,"a",(function(){return a}));var e=n(0),r=n(16),i=n(103),o=n(13);class a{constructor(c){this.http=c,this.resourceUrl=r.b+"api/regions"}create(c){return this.http.post(this.resourceUrl,c,{observe:"response"})}update(c){return this.http.put(this.resourceUrl,c,{observe:"response"})}find(c){return this.http.get(`${this.resourceUrl}/${c}`,{observe:"response"})}query(c){const t=Object(i.a)(c);return this.http.get(this.resourceUrl,{params:t,observe:"response"})}delete(c){return this.http.delete(`${this.resourceUrl}/${c}`,{observe:"response"})}}a.ɵfac=function(c){return new(c||a)(e.oc(o.b))},a.ɵprov=e.Xb({token:a,factory:a.ɵfac,providedIn:"root"})},107:function(c,t,n){n.d(t,"a",(function(){return a}));var e=n(0),r=n(16),i=n(103),o=n(13);class a{constructor(c){this.http=c,this.resourceUrl=r.b+"api/countries"}create(c){return this.http.post(this.resourceUrl,c,{observe:"response"})}update(c){return this.http.put(this.resourceUrl,c,{observe:"response"})}find(c){return this.http.get(`${this.resourceUrl}/${c}`,{observe:"response"})}query(c){const t=Object(i.a)(c);return this.http.get(this.resourceUrl,{params:t,observe:"response"})}delete(c){return this.http.delete(`${this.resourceUrl}/${c}`,{observe:"response"})}}a.ɵfac=function(c){return new(c||a)(e.oc(o.b))},a.ɵprov=e.Xb({token:a,factory:a.ɵfac,providedIn:"root"})},124:function(c,t,n){n.r(t),n.d(t,"JhipsterCountryModule",(function(){return _}));var e=n(0),r=n(4),i=n(37),o=n(107),a=n(6),s=n(3),u=n(2),d=n(5),l=n(55),f=n(21);const S=function(c){return{id:c}};function p(c,t){if(1&c){const c=e.hc();e.gc(0,"form",1),e.rc("ngSubmit",(function(){e.Jc(c);const t=e.tc();return t.confirmDelete(null==t.country?null:t.country.id)})),e.Sc(1,"\n    "),e.gc(2,"div",2),e.Sc(3,"\n        "),e.gc(4,"h4",3),e.Sc(5,"Confirm delete operation"),e.fc(),e.Sc(6,"\n\n        "),e.gc(7,"button",4),e.rc("click",(function(){e.Jc(c);return e.tc().cancel()})),e.Sc(8,"×"),e.fc(),e.Sc(9,"\n    "),e.fc(),e.Sc(10,"\n\n    "),e.gc(11,"div",5),e.Sc(12,"\n        "),e.cc(13,"jhi-alert-error"),e.Sc(14,"\n\n        "),e.gc(15,"p",6),e.Sc(16,"Are you sure you want to delete this Country?"),e.fc(),e.Sc(17,"\n    "),e.fc(),e.Sc(18,"\n\n    "),e.gc(19,"div",7),e.Sc(20,"\n        "),e.gc(21,"button",8),e.rc("click",(function(){e.Jc(c);return e.tc().cancel()})),e.Sc(22,"\n            "),e.cc(23,"fa-icon",9),e.Sc(24," "),e.gc(25,"span",10),e.Sc(26,"Cancel"),e.fc(),e.Sc(27,"\n        "),e.fc(),e.Sc(28,"\n\n        "),e.gc(29,"button",11),e.Sc(30,"\n            "),e.cc(31,"fa-icon",12),e.Sc(32," "),e.gc(33,"span",13),e.Sc(34,"Delete"),e.fc(),e.Sc(35,"\n        "),e.fc(),e.Sc(36,"\n    "),e.fc(),e.Sc(37,"\n"),e.fc()}if(2&c){const c=e.tc();e.Ob(15),e.Ac("translateValues",e.Ec(1,S,c.country.id))}}class h{constructor(c,t,n){this.countryService=c,this.activeModal=t,this.eventManager=n}cancel(){this.activeModal.dismiss()}confirmDelete(c){this.countryService.delete(c).subscribe(()=>{this.eventManager.broadcast("countryListModification"),this.activeModal.close()})}}h.ɵfac=function(c){return new(c||h)(e.bc(o.a),e.bc(a.a),e.bc(s.d))},h.ɵcmp=e.Vb({type:h,selectors:[["ng-component"]],decls:2,vars:1,consts:[["name","deleteForm",3,"ngSubmit",4,"ngIf"],["name","deleteForm",3,"ngSubmit"],[1,"modal-header"],["jhiTranslate","entity.delete.title",1,"modal-title"],["type","button","data-dismiss","modal","aria-hidden","true",1,"close",3,"click"],[1,"modal-body"],["id","jhi-delete-country-heading","jhiTranslate","jhipsterApp.country.delete.question",3,"translateValues"],[1,"modal-footer"],["type","button","data-dismiss","modal",1,"btn","btn-secondary",3,"click"],["icon","ban"],["jhiTranslate","entity.action.cancel"],["id","jhi-confirm-delete-country","type","submit",1,"btn","btn-danger"],["icon","times"],["jhiTranslate","entity.action.delete"]],template:function(c,t){1&c&&(e.Qc(0,p,38,3,"form",0),e.Sc(1,"\n")),2&c&&e.Ac("ngIf",t.country)},directives:[u.o,d.u,d.j,d.k,s.m,l.a,f.a],encapsulation:2});var g=n(56);function b(c,t){1&c&&(e.gc(0,"div",7),e.Sc(1,"\n        "),e.gc(2,"span",8),e.Sc(3,"No countries found"),e.fc(),e.Sc(4,"\n    "),e.fc())}const y=function(c){return["/region",c,"view"]};function m(c,t){if(1&c&&(e.gc(0,"div"),e.Sc(1,"\n                            "),e.gc(2,"a",16),e.Sc(3),e.fc(),e.Sc(4,"\n                        "),e.fc()),2&c){const c=e.tc().$implicit;e.Ob(2),e.Ac("routerLink",e.Ec(2,y,c.regionId)),e.Ob(1),e.Tc(c.regionId)}}const v=function(c){return["/country",c,"view"]},j=function(c){return["/country",c,"edit"]};function A(c,t){if(1&c){const c=e.hc();e.gc(0,"tr"),e.Sc(1,"\n                    "),e.gc(2,"td"),e.gc(3,"a",16),e.Sc(4),e.fc(),e.fc(),e.Sc(5,"\n                    "),e.gc(6,"td"),e.Sc(7),e.fc(),e.Sc(8,"\n                    "),e.gc(9,"td"),e.Sc(10,"\n                        "),e.Qc(11,m,5,4,"div",17),e.Sc(12,"\n                    "),e.fc(),e.Sc(13,"\n                    "),e.gc(14,"td",18),e.Sc(15,"\n                        "),e.gc(16,"div",19),e.Sc(17,"\n                            "),e.gc(18,"button",20),e.Sc(19,"\n                                "),e.cc(20,"fa-icon",21),e.Sc(21,"\n                                "),e.gc(22,"span",22),e.Sc(23,"View"),e.fc(),e.Sc(24,"\n                            "),e.fc(),e.Sc(25,"\n\n                            "),e.gc(26,"button",23),e.Sc(27,"\n                                "),e.cc(28,"fa-icon",24),e.Sc(29,"\n                                "),e.gc(30,"span",25),e.Sc(31,"Edit"),e.fc(),e.Sc(32,"\n                            "),e.fc(),e.Sc(33,"\n\n                            "),e.gc(34,"button",26),e.rc("click",(function(){e.Jc(c);const n=t.$implicit;return e.tc(2).delete(n)})),e.Sc(35,"\n                                "),e.cc(36,"fa-icon",27),e.Sc(37,"\n                                "),e.gc(38,"span",28),e.Sc(39,"Delete"),e.fc(),e.Sc(40,"\n                            "),e.fc(),e.Sc(41,"\n                        "),e.fc(),e.Sc(42,"\n                    "),e.fc(),e.Sc(43,"\n                "),e.fc()}if(2&c){const c=t.$implicit;e.Ob(3),e.Ac("routerLink",e.Ec(6,v,c.id)),e.Ob(1),e.Tc(c.id),e.Ob(3),e.Tc(c.countryName),e.Ob(4),e.Ac("ngIf",c.regionId),e.Ob(7),e.Ac("routerLink",e.Ec(8,v,c.id)),e.Ob(8),e.Ac("routerLink",e.Ec(10,j,c.id))}}function O(c,t){if(1&c&&(e.gc(0,"div",9),e.Sc(1,"\n        "),e.gc(2,"table",10),e.Sc(3,"\n            "),e.gc(4,"thead"),e.Sc(5,"\n                "),e.gc(6,"tr"),e.Sc(7,"\n                    "),e.gc(8,"th",11),e.gc(9,"span",12),e.Sc(10,"ID"),e.fc(),e.fc(),e.Sc(11,"\n                    "),e.gc(12,"th",11),e.gc(13,"span",13),e.Sc(14,"Country Name"),e.fc(),e.fc(),e.Sc(15,"\n                    "),e.gc(16,"th",11),e.gc(17,"span",14),e.Sc(18,"Region"),e.fc(),e.fc(),e.Sc(19,"\n                    "),e.cc(20,"th",11),e.Sc(21,"\n                "),e.fc(),e.Sc(22,"\n            "),e.fc(),e.Sc(23,"\n            "),e.gc(24,"tbody"),e.Sc(25,"\n                "),e.Qc(26,A,44,12,"tr",15),e.Sc(27,"\n            "),e.fc(),e.Sc(28,"\n        "),e.fc(),e.Sc(29,"\n    "),e.fc()),2&c){const c=e.tc();e.Ob(26),e.Ac("ngForOf",c.countries)("ngForTrackBy",c.trackId)}}const k=function(){return["/country/new"]};class I{constructor(c,t,n){this.countryService=c,this.eventManager=t,this.modalService=n}loadAll(){this.countryService.query().subscribe(c=>this.countries=c.body||[])}ngOnInit(){this.loadAll(),this.registerChangeInCountries()}ngOnDestroy(){this.eventSubscriber&&this.eventManager.destroy(this.eventSubscriber)}trackId(c,t){return t.id}registerChangeInCountries(){this.eventSubscriber=this.eventManager.subscribe("countryListModification",()=>this.loadAll())}delete(c){this.modalService.open(h,{size:"lg",backdrop:"static"}).componentInstance.country=c}}I.ɵfac=function(c){return new(c||I)(e.bc(o.a),e.bc(s.d),e.bc(a.i))},I.ɵcmp=e.Vb({type:I,selectors:[["jhi-country"]],decls:25,vars:4,consts:[["id","page-heading"],["jhiTranslate","jhipsterApp.country.home.title"],["id","jh-create-entity",1,"btn","btn-primary","float-right","jh-create-entity","create-country",3,"routerLink"],["icon","plus"],["jhiTranslate","jhipsterApp.country.home.createLabel"],["class","alert alert-warning","id","no-result",4,"ngIf"],["class","table-responsive","id","entities",4,"ngIf"],["id","no-result",1,"alert","alert-warning"],["jhiTranslate","jhipsterApp.country.home.notFound"],["id","entities",1,"table-responsive"],["aria-describedby","page-heading",1,"table","table-striped"],["scope","col"],["jhiTranslate","global.field.id"],["jhiTranslate","jhipsterApp.country.countryName"],["jhiTranslate","jhipsterApp.country.region"],[4,"ngFor","ngForOf","ngForTrackBy"],[3,"routerLink"],[4,"ngIf"],[1,"text-right"],[1,"btn-group"],["type","submit",1,"btn","btn-info","btn-sm",3,"routerLink"],["icon","eye"],["jhiTranslate","entity.action.view",1,"d-none","d-md-inline"],["type","submit",1,"btn","btn-primary","btn-sm",3,"routerLink"],["icon","pencil-alt"],["jhiTranslate","entity.action.edit",1,"d-none","d-md-inline"],["type","submit",1,"btn","btn-danger","btn-sm",3,"click"],["icon","times"],["jhiTranslate","entity.action.delete",1,"d-none","d-md-inline"]],template:function(c,t){1&c&&(e.gc(0,"div"),e.Sc(1,"\n    "),e.gc(2,"h2",0),e.Sc(3,"\n        "),e.gc(4,"span",1),e.Sc(5,"Countries"),e.fc(),e.Sc(6,"\n\n        "),e.gc(7,"button",2),e.Sc(8,"\n            "),e.cc(9,"fa-icon",3),e.Sc(10,"\n            "),e.gc(11,"span",4),e.Sc(12,"\n            Create a new Country\n            "),e.fc(),e.Sc(13,"\n        "),e.fc(),e.Sc(14,"\n    "),e.fc(),e.Sc(15,"\n\n    "),e.cc(16,"jhi-alert-error"),e.Sc(17,"\n\n    "),e.cc(18,"jhi-alert"),e.Sc(19,"\n\n    "),e.Qc(20,b,5,0,"div",5),e.Sc(21,"\n\n    "),e.Qc(22,O,30,2,"div",6),e.Sc(23,"\n"),e.fc(),e.Sc(24,"\n")),2&c&&(e.Ob(7),e.Ac("routerLink",e.Dc(3,k)),e.Ob(13),e.Ac("ngIf",0===(null==t.countries?null:t.countries.length)),e.Ob(2),e.Ac("ngIf",t.countries&&t.countries.length>0))},directives:[s.m,r.e,f.a,l.a,g.a,u.o,u.n,r.g],encapsulation:2});const T=function(c){return["/region",c,"view"]};function w(c,t){if(1&c&&(e.gc(0,"div"),e.Sc(1,"\n                        "),e.gc(2,"a",13),e.Sc(3),e.fc(),e.Sc(4,"\n                    "),e.fc()),2&c){const c=e.tc(2);e.Ob(2),e.Ac("routerLink",e.Ec(2,T,c.country.regionId)),e.Ob(1),e.Tc(c.country.regionId)}}const F=function(c){return["/country",c,"edit"]};function C(c,t){if(1&c){const c=e.hc();e.gc(0,"div"),e.Sc(1,"\n            "),e.gc(2,"h2"),e.gc(3,"span",3),e.Sc(4,"Country"),e.fc(),e.Sc(5),e.fc(),e.Sc(6,"\n\n            "),e.cc(7,"hr"),e.Sc(8,"\n\n            "),e.cc(9,"jhi-alert-error"),e.Sc(10,"\n\n            "),e.gc(11,"dl",4),e.Sc(12,"\n                "),e.gc(13,"dt"),e.gc(14,"span",5),e.Sc(15,"Country Name"),e.fc(),e.fc(),e.Sc(16,"\n                "),e.gc(17,"dd"),e.Sc(18,"\n                    "),e.gc(19,"span"),e.Sc(20),e.fc(),e.Sc(21,"\n                "),e.fc(),e.Sc(22,"\n                "),e.gc(23,"dt"),e.gc(24,"span",6),e.Sc(25,"Region"),e.fc(),e.fc(),e.Sc(26,"\n                "),e.gc(27,"dd"),e.Sc(28,"\n                    "),e.Qc(29,w,5,4,"div",2),e.Sc(30,"\n                "),e.fc(),e.Sc(31,"\n            "),e.fc(),e.Sc(32,"\n\n            "),e.gc(33,"button",7),e.rc("click",(function(){e.Jc(c);return e.tc().previousState()})),e.Sc(34,"\n                "),e.cc(35,"fa-icon",8),e.Sc(36," "),e.gc(37,"span",9),e.Sc(38,"Back"),e.fc(),e.Sc(39,"\n            "),e.fc(),e.Sc(40,"\n\n            "),e.gc(41,"button",10),e.Sc(42,"\n                "),e.cc(43,"fa-icon",11),e.Sc(44," "),e.gc(45,"span",12),e.Sc(46,"Edit"),e.fc(),e.Sc(47,"\n            "),e.fc(),e.Sc(48,"\n        "),e.fc()}if(2&c){const c=e.tc();e.Ob(5),e.Uc(" ",c.country.id,""),e.Ob(15),e.Tc(c.country.countryName),e.Ob(9),e.Ac("ngIf",c.country.regionId),e.Ob(12),e.Ac("routerLink",e.Ec(4,F,c.country.id))}}class N{constructor(c){this.activatedRoute=c,this.country=null}ngOnInit(){this.activatedRoute.data.subscribe(({country:c})=>this.country=c)}previousState(){window.history.back()}}N.ɵfac=function(c){return new(c||N)(e.bc(r.a))},N.ɵcmp=e.Vb({type:N,selectors:[["jhi-country-detail"]],decls:8,vars:1,consts:[[1,"row","justify-content-center"],[1,"col-8"],[4,"ngIf"],["jhiTranslate","jhipsterApp.country.detail.title"],[1,"row-md","jh-entity-details"],["jhiTranslate","jhipsterApp.country.countryName"],["jhiTranslate","jhipsterApp.country.region"],["type","submit",1,"btn","btn-info",3,"click"],["icon","arrow-left"],["jhiTranslate","entity.action.back"],["type","button",1,"btn","btn-primary",3,"routerLink"],["icon","pencil-alt"],["jhiTranslate","entity.action.edit"],[3,"routerLink"]],template:function(c,t){1&c&&(e.gc(0,"div",0),e.Sc(1,"\n    "),e.gc(2,"div",1),e.Sc(3,"\n        "),e.Qc(4,C,49,6,"div",2),e.Sc(5,"\n    "),e.fc(),e.Sc(6,"\n"),e.fc(),e.Sc(7,"\n")),2&c&&(e.Ob(4),e.Ac("ngIf",t.country))},directives:[u.o,s.m,l.a,f.a,r.e,r.g],encapsulation:2});var E=n(20);class L{constructor(c,t,n){this.id=c,this.countryName=t,this.regionId=n}}var U=n(106);function M(c,t){if(1&c&&(e.gc(0,"option",12),e.Sc(1),e.fc()),2&c){const c=t.$implicit;e.Ac("ngValue",c.id),e.Ob(1),e.Tc(c.id)}}class R{constructor(c,t,n,e){this.countryService=c,this.regionService=t,this.activatedRoute=n,this.fb=e,this.isSaving=!1,this.regions=[],this.editForm=this.fb.group({id:[],countryName:[],regionId:[]})}ngOnInit(){this.activatedRoute.data.subscribe(({country:c})=>{this.updateForm(c),this.regionService.query({filter:"country-is-null"}).pipe(Object(E.a)(c=>c.body||[])).subscribe(t=>{c.regionId?this.regionService.find(c.regionId).pipe(Object(E.a)(c=>c.body?[c.body].concat(t):t)).subscribe(c=>this.regions=c):this.regions=t})})}updateForm(c){this.editForm.patchValue({id:c.id,countryName:c.countryName,regionId:c.regionId})}previousState(){window.history.back()}save(){this.isSaving=!0;const c=this.createFromForm();void 0!==c.id?this.subscribeToSaveResponse(this.countryService.update(c)):this.subscribeToSaveResponse(this.countryService.create(c))}createFromForm(){return Object.assign(Object.assign({},new L),{id:this.editForm.get(["id"]).value,countryName:this.editForm.get(["countryName"]).value,regionId:this.editForm.get(["regionId"]).value})}subscribeToSaveResponse(c){c.subscribe(()=>this.onSaveSuccess(),()=>this.onSaveError())}onSaveSuccess(){this.isSaving=!1,this.previousState()}onSaveError(){this.isSaving=!1}trackById(c,t){return t.id}}R.ɵfac=function(c){return new(c||R)(e.bc(o.a),e.bc(U.a),e.bc(r.a),e.bc(d.c))},R.ɵcmp=e.Vb({type:R,selectors:[["jhi-country-update"]],decls:65,vars:6,consts:[[1,"row","justify-content-center"],[1,"col-8"],["name","editForm","role","form","novalidate","",3,"formGroup","ngSubmit"],["id","jhi-country-heading","jhiTranslate","jhipsterApp.country.home.createOrEditLabel"],[1,"form-group",3,"hidden"],["for","id","jhiTranslate","global.field.id"],["type","text","id","id","name","id","formControlName","id","readonly","readonly",1,"form-control"],[1,"form-group"],["jhiTranslate","jhipsterApp.country.countryName","for","field_countryName",1,"form-control-label"],["type","text","name","countryName","id","field_countryName","formControlName","countryName",1,"form-control"],["jhiTranslate","jhipsterApp.country.region","for","field_region",1,"form-control-label"],["id","field_region","name","region","formControlName","regionId",1,"form-control"],[3,"ngValue"],[3,"ngValue",4,"ngFor","ngForOf","ngForTrackBy"],["type","button","id","cancel-save",1,"btn","btn-secondary",3,"click"],["icon","ban"],["jhiTranslate","entity.action.cancel"],["type","submit","id","save-entity",1,"btn","btn-primary",3,"disabled"],["icon","save"],["jhiTranslate","entity.action.save"]],template:function(c,t){1&c&&(e.gc(0,"div",0),e.Sc(1,"\n    "),e.gc(2,"div",1),e.Sc(3,"\n        "),e.gc(4,"form",2),e.rc("ngSubmit",(function(){return t.save()})),e.Sc(5,"\n            "),e.gc(6,"h2",3),e.Sc(7,"Create or edit a Country"),e.fc(),e.Sc(8,"\n\n            "),e.gc(9,"div"),e.Sc(10,"\n                "),e.cc(11,"jhi-alert-error"),e.Sc(12,"\n\n                "),e.gc(13,"div",4),e.Sc(14,"\n                    "),e.gc(15,"label",5),e.Sc(16,"ID"),e.fc(),e.Sc(17,"\n                    "),e.cc(18,"input",6),e.Sc(19,"\n                "),e.fc(),e.Sc(20,"\n\n                "),e.gc(21,"div",7),e.Sc(22,"\n                    "),e.gc(23,"label",8),e.Sc(24,"Country Name"),e.fc(),e.Sc(25,"\n                    "),e.cc(26,"input",9),e.Sc(27,"\n                "),e.fc(),e.Sc(28,"\n\n                "),e.gc(29,"div",7),e.Sc(30,"\n                    "),e.gc(31,"label",10),e.Sc(32,"Region"),e.fc(),e.Sc(33,"\n                    "),e.gc(34,"select",11),e.Sc(35,"\n                        "),e.cc(36,"option",12),e.Sc(37,"\n                        "),e.Qc(38,M,2,2,"option",13),e.Sc(39,"\n                    "),e.fc(),e.Sc(40,"\n                "),e.fc(),e.Sc(41,"\n            "),e.fc(),e.Sc(42,"\n\n            "),e.gc(43,"div"),e.Sc(44,"\n                "),e.gc(45,"button",14),e.rc("click",(function(){return t.previousState()})),e.Sc(46,"\n                    "),e.cc(47,"fa-icon",15),e.Sc(48," "),e.gc(49,"span",16),e.Sc(50,"Cancel"),e.fc(),e.Sc(51,"\n                "),e.fc(),e.Sc(52,"\n\n                "),e.gc(53,"button",17),e.Sc(54,"\n                    "),e.cc(55,"fa-icon",18),e.Sc(56," "),e.gc(57,"span",19),e.Sc(58,"Save"),e.fc(),e.Sc(59,"\n                "),e.fc(),e.Sc(60,"\n            "),e.fc(),e.Sc(61,"\n        "),e.fc(),e.Sc(62,"\n    "),e.fc(),e.Sc(63,"\n"),e.fc(),e.Sc(64,"\n")),2&c&&(e.Ob(4),e.Ac("formGroup",t.editForm),e.Ob(9),e.Ac("hidden",!t.editForm.get("id").value),e.Ob(23),e.Ac("ngValue",null),e.Ob(2),e.Ac("ngForOf",t.regions)("ngForTrackBy",t.trackById),e.Ob(15),e.Ac("disabled",t.editForm.invalid||t.isSaving))},directives:[d.u,d.j,d.e,s.m,l.a,d.b,d.i,d.d,d.q,d.m,d.t,u.n,f.a],encapsulation:2});var V=n(17),$=n(42),J=n(60),D=n(68),Q=n(69);class B{constructor(c,t){this.service=c,this.router=t}resolve(c){const t=c.params.id;return t?this.service.find(t).pipe(Object(J.a)(c=>c.body?Object(V.a)(c.body):(this.router.navigate(["404"]),$.a))):Object(V.a)(new L)}}B.ɵfac=function(c){return new(c||B)(e.oc(o.a),e.oc(r.d))},B.ɵprov=e.Xb({token:B,factory:B.ɵfac,providedIn:"root"});const q=[{path:"",component:I,data:{authorities:[D.a.USER],pageTitle:"jhipsterApp.country.home.title"},canActivate:[Q.a]},{path:":id/view",component:N,resolve:{country:B},data:{authorities:[D.a.USER],pageTitle:"jhipsterApp.country.home.title"},canActivate:[Q.a]},{path:"new",component:R,resolve:{country:B},data:{authorities:[D.a.USER],pageTitle:"jhipsterApp.country.home.title"},canActivate:[Q.a]},{path:":id/edit",component:R,resolve:{country:B},data:{authorities:[D.a.USER],pageTitle:"jhipsterApp.country.home.title"},canActivate:[Q.a]}];class _{}_.ɵmod=e.Zb({type:_}),_.ɵinj=e.Yb({factory:function(c){return new(c||_)},imports:[[i.a,r.h.forChild(q)]]}),("undefined"==typeof ngJitMode||ngJitMode)&&e.Mc(_,{declarations:[I,N,R,h],imports:[i.a,r.h]})}}]);