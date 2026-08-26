import{L as t}from"./layout-dashboard-BZtSvBzO.js";import{C as o}from"./clipboard-list-D4LmKAW9.js";import{c as a}from"./index-BCRhyQIw.js";import{B as i}from"./brush--DjPr3AN.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M2 12h20",key:"9i4pu4"}],["path",{d:"M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8",key:"u0tga0"}],["path",{d:"m4 8 16-4",key:"16g0ng"}],["path",{d:"m8.86 6.78-.45-1.81a2 2 0 0 1 1.45-2.43l1.94-.48a2 2 0 0 1 2.43 1.46l.45 1.8",key:"12cejc"}]],d=a("cooking-pot",c);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const r=[["path",{d:"M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14",key:"e7tb2h"}],["path",{d:"m7.5 4.27 9 5.15",key:"1c824w"}],["polyline",{points:"3.29 7 12 12 20.71 7",key:"ousv84"}],["line",{x1:"12",x2:"12",y1:"22",y2:"12",key:"a4e8g8"}],["circle",{cx:"18.5",cy:"15.5",r:"2.5",key:"b5zd12"}],["path",{d:"M20.27 17.27 22 19",key:"1l4muz"}]],l=a("package-search",r),p=[{id:"dashboard",to:"/admin/dashboard",label:"Overview",icon:t},{id:"orders",to:"/admin/orders",label:"Orders",icon:o},{id:"kitchen",to:"/admin/kitchen",label:"Kitchen",icon:d},{id:"catalog",to:"/admin/products",label:"Catalog",icon:l},{id:"theme",to:"/admin/theme",label:"Theme",icon:i}],k=[{id:"active",label:"Active",matcher:e=>e.status!=="Delivered"},{id:"pickup",label:"Pickup",matcher:e=>["Order Placed","Preparing"].includes(e.status)},{id:"route",label:"On Route",matcher:e=>e.status==="Out for Delivery"},{id:"done",label:"Done",matcher:e=>e.status==="Delivered"}];export{p as A,d as C,k as D,l as P};
