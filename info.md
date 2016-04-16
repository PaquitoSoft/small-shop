

Category:
=========


Product:
========
{
	id: 1,
	name: '',
	description: '',
	price: 12,30
	oldPrice: 15,00
	categoryId: 2,
	colors: [{
		id: 1,
		name: ''
		image: '',
		pictures: ['']
	}],
	sizes: [{
		id: 3,
		name: '',
		stock: true
	}]
}

Category page
-------------
.product-items-content .product-item
	.product-item-headline a ---> id / name
	.product-item-price ---> price
	.product-item-colors li span -> colorName

Product page
------------
.product-detail
	.product-detail-thumbnails
		.product-detail-thumbnail img ----> product color thumbnails [thumb|main]

	.product-colors
		li label["title"] ---> colorName
		li input["data-articlecode"] ---> colorId
		li input["data-sizes"] ---> color available sizes
		li .detailbox img ---> colorImage

	.product-sizes
		ul.inputlist:first
			li input["data-size"] ---> sizeId
			li input["value"] ---> sizeName
			li input["disabled"] ---> out of stock


little
//lp2.hm.com/hmprod?set=source[/environment/2016/6IT_0193_012R.jpg],
	width[3857],
	height[4510],
	x[826],
	y[361],
	type[FASHION_FRONT]
	&hmver=1
	&call=url[file:/product/	thumb]

big
//lp2.hm.com/hmprod?set=source[/environment/2016/6IT_0193_012R.jpg],
	width[3857],
	height[4510],
	x[826],
	y[361],
	type[FASHION_FRONT]
	&hmver=1
	&call=url[file:/product/	main]




http://lp2.hm.com/hmprod?set=source[/model/2016/C00%200351369%20005%2023%202259.jpg],width[1190],height[1391],x[119],y[51],type[DETAIL]&hmver=2&call=url[file:/product/thumb]


http://lp2.hm.com/hmprod?set=source[/model/2016/C00%200351369%20005%2023%202259.jpg],width[1190],height[1391],x[119],y[51],type[DETAIL]&hmver=2&call=url[file:/product/main]
