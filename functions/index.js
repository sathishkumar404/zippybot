
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


 const  emailValid = function(promptContext) { 

       var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;

        if (reg.test(promptContext.recognized.value) == false && promptContext.recognized.succeeded) 
        {   
           
            return false;
        } 

        return true;
    } 



 const  phoneValid = function(promptContext) { 

       var reg = /^(\([0-9]{3}\)|[0-9]{3}-)[0-9]{3}-[0-9]{4}$/;

        if (reg.test(promptContext.recognized.value) == false && promptContext.recognized.succeeded) 
        {   
            console.log('false us phone no');
            return false;
        } 
        console.log('right us number');
        return true;
    }  



     const  validDate = function(promptContext) {  

         if (!promptContext.recognized.succeeded) { 
            return false;
         }

    var objDate,  // date object initialized from the ExpiryDate string 
        mSeconds, // ExpiryDate in milliseconds 
        day,      // day 
        month,    // month 
        year;     // year 
    // date length should be 10 characters (no more no less)  
    var ExpiryDate = promptContext.recognized.value; 
    console.log(ExpiryDate);
    if (ExpiryDate.length !== 10) { 
        return false; 
    } 
   // third and sixth character should be '/'  
    if (ExpiryDate.substring(2, 3) !== '/' || ExpiryDate.substring(5, 6) !== '/') {  
        console.log('slash');
        return false; 
    } 
    // extract month, day and year from the ExpiryDate (expected format is mm/dd/yyyy) 
    // subtraction will cast variables to integer implicitly (needed 
    // for !== comparing) 
    month = ExpiryDate.substring(0, 2) - 1; // because months in JS start from 0 
    day = ExpiryDate.substring(3, 5) - 0; 
    year = ExpiryDate.substring(6, 10) - 0; 
    // test year range 
    if (year < 1000 || year > 3000) {  
        console.log('year range');
        return false; 
    } 
    // convert ExpiryDate to milliseconds 
    mSeconds = (new Date(year, month, day)).getTime(); 
    // initialize Date() object from calculated milliseconds 
    objDate = new Date(); 
    objDate.setTime(mSeconds); 
    // compare input date and parts from Date() object 
    // if difference exists then date isn't valid 
    if (objDate.getFullYear() !== year || 
        objDate.getMonth() !== month || 
        objDate.getDate() !== day) {  
        console.log('last problem');
        return false; 
    } 
    // otherwise return true 
    return true; 

    
    }  

    const  numberValid = function(promptContext) { 

       var reg = /^[0-9]{3}-[0-9]{3}-[0-9]{4}$/;

        if (isNaN(promptContext.recognized.value) == true && promptContext.recognized.succeeded) 
        {   
            return false;
        } 
        return true;
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
	getPolicy,
    emailValid,
    phoneValid,
    validDate,
    numberValid
};