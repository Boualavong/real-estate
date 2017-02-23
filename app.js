//importing modules (-> librairies)
var express = require( 'express' );
var request = require( 'request' );
var cheerio = require( 'cheerio' );
var bodyParser=require('body-parser'); 

//creating a new express server -> express est un module pour le créer
var app = express();

//setting EJS as the templating engine -> template
app.set( 'view engine', 'ejs' );

//setting the 'assets' directory as our static assets dir (css, js, img, etc...)
app.use( '/assets', express.static( 'assets' ) );

//makes the server respond to the '/' route and serving the 'home.ejs' template in the 'views' directory
//page d'accueil qui s'affiche par défaut
//function est anonyme, utilisée par souci de performance (+ rapide). req=requete, res=reponse ( qui renvoie à la page d'accueil)
app.get( '/', function ( req, res ) {
res.render(__dirname+'/views/pages/index')
});

app.use(bodyParser.urlencoded({
	extended:true
}));


app.post('/scrape',function(req,res){
	 const url= req.body.lien;

    if(url!="")  //récupère url qu'on analyse
	{ 
	   getLBCData(url,res,getMAEstimation) //geetMAE fn call back qui s'execute une fois que getLBCData est executée
    }
    else
    { //si url est pas rempli
    	console.log("on est pas bon")
       res.render('pages/index', { 
          error:'Url is empty'
          }); //j'ai un répertoire page avec index.html
     }

    // res.render( 'home', {
    //     message: 'The Home Page!'
});
   


function getLBCData(lbcUrl,routeResponse, callback)
{
	request( lbcUrl,function(error,response,html)
	{
		if(!error)
		{
			const lcbData=parseLBCData(html);

			if(lbcData) //si on extrait les données, callback est appelée
			 {
				console.log('LBCData:',lbcData)//affiche dans la console
				callback(lbcData,routeResponse)
			 }

			else
			 {
				routeResponse.render('pages/index',
					{error:'No data found'});
			 }
		}

		else
		{
			routeResponse.render('pages/index',
			{error:'Error loading the given URL'});
		}

		
	});
}


function parseLBCData(html)
{
	const $ =cheerio.load(html)

	const lbcDataArray=$ ('#adview > section > section > section.properties.lineNegative > div:nth-child(7) > h2 > span.value')

	//toutes les vleurs des noeuds "span" qui sont fils de section.properties
	//stocke dans un tableau
	//récupérer les données à partir du tableau

	return lbcData={
		type: ( $ ( lbcDataArray )
		        .text().replace(/\s/g, ''),10 )

	}
}


function getMAEstimation(lbcData, routeResponse)
{
	if( lbcData.city && lbcData.postalCode && lbcData.surface && lbcData.price)
	{
		const url='https://wwww.meilleursagents.com/prix-immobilier/{city}-{postalCode}/'.replace('{city}',
			lbcData.city.replace(/\_/g,'-') )
		.replace( '{postalCode}', lbcData.postalCode);

		console.log('MA URL: ', url)

		request ( url, function (error,response, html)
			{
				if(!error){ let $ = cheerio.load(html);}//module pour parser le doc html (parser=analyser)}
			}

		       )
	}
}

function isGoodDeal(lbcData,maData)
{
	const adPricePerSqM=Math.round(lbcData.price / lbcData.surface)
	const maPrice = lbcData.type === 'appartement' ? maData.priceAppart:maData.priceHouse

	return adPricePerSqM < maPrice
}



//launch the server on the 3000 port
app.listen( 3000, function () {
    console.log( 'App listening on port 3000!' );
});