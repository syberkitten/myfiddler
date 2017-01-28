/**
 * Created by liam.bilich on 28/01/2017.
 */


/**
 * methods in this array receive these params from the middleware of connect
 * @type {Array}
 */
const Request_Train = [

]





module.exports = {
    sendRequest:function(req,res){
        Request_Train.forEach(function(passengerFunc){
           passengerFunc(req,res);
        });
    },
    getRequest:function(passengerFunc,scope) {
        var func = passengerFunc.bind(scope)
        Request_Train.push(func);
    }
}