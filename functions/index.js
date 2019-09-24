
var axios = require('axios'); 

const capitalize = function(str){
     var splittedEnter = str.split(" ");
     var capitalized;
     var capitalizedResult;
     for (var i = 0 ; i < splittedEnter.length ; i++){
         capitalized = splittedEnter[i].charAt(0).toUpperCase();
         splittedEnter[i] = capitalized + splittedEnter[i].substr(1).toLowerCase();
    }
    return splittedEnter.join(" ");
} 


const getPolicy =  async function(str,callback){ 
	
	
	   let host = 'https://insurancemock.azurewebsites.net/api/GetClaimDetails?code=lc/InAMzCuUdP8LE5TatZZ9outMFSed17bsHhRLIlIfOWaGQbXpj9g==&name='+str; 
    
      axios.get(host)
    .then(async function  (response) {  
        var data = response.data; 
        console.log(data);
       return await data;
    });  
   


}



module.exports = {
	capitalize,
	getPolicy
};