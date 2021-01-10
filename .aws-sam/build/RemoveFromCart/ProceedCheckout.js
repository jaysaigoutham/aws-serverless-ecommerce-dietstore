const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

exports.handler = async (event, context, callback) => {
    
    //1. Extract the query parameters & validate
    console.log("Starting...");
    
    var body = event.body;
  
    var skipValidation  = true;
    console.log('Body:', event.body);
    if (body !== null && body !== undefined && !skipValidation) {
        if (!(body.UserId)) 
        {
            return {
              statusCode: 409,
              body: JSON.stringify({message: 'Required data was missing', error:null})
            };
        }
        else
        {
            console.log('All required data was supplied');
        }
    }
    
    var givenUserID = body.UserId;
    //var givenUserID = "user002";
    
    //Find all user ID
     const paramsValidation = {
        TableName: 'ShoppingCart',
        FilterExpression: "#UserId = :UserId",
        ExpressionAttributeNames: {
            "#UserId": "UserId",
        },
        ExpressionAttributeValues: {
          ':UserId': givenUserID
        }
      };
      
    
    let scanResults = [];
    let items;
    do{
        items =  await documentClient.scan(paramsValidation).promise();
        items.Items.forEach((item) => scanResults.push(item));
        paramsValidation.ExclusiveStartKey  = items.LastEvaluatedKey;
    }while(typeof items.LastEvaluatedKey != "undefined");
      
    console.log(scanResults);
    console.log(scanResults.length);

      
      
var orderProducts = "";
if(scanResults.length == 0)
{
    return  {
                statusCode: 408,
                body: JSON.stringify({ message: 'The item does not exist' })
              };
}
for(let val of scanResults) {
    orderProducts = orderProducts + val["ProductID"] + "(" + val["Quantity"] + ")";
}

console.log(orderProducts);
  
 
    
    // Add to shopping cart
    var params = {
        TableName: "Order",
        Item: {
            'OrderID' : givenUserID + "-" + getRandomString(4),
            'OrderSummary': orderProducts,
            'UserId' : givenUserID,
            'CreatedAt': Math.round((new Date()).getTime() / 1000)
        }
    };
    
     try {
      let result = await documentClient.put(params).promise();
        console.log("Result..." + result);
        if (result === undefined || result.Count == 0) {
            return  {
                statusCode: 408,
                body: JSON.stringify({ message: 'The item does not exist2' })
              };
        }
        
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 418,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
    
    var response;
    
    
    try {
        var result;
        console.log("delete initial called");
        for(let val of scanResults) { 
            console.log("delete loop called");
            result = await delete_shoppingCart(val["ShoppingCartID"],givenUserID);
            console.log("result" + JSON.stringify(result));
        }
        
        
        
        
        return  {
                statusCode: 200,
                body: JSON.stringify({ message: 'Order has been added sucessfully!' })
              };
        
     
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
 
};

function delete_shoppingCart(id, user_id) {
  
  console.log("delete called" + id);
  
   var tempParam = {
                TableName: "ShoppingCart",
                Key: {
                    "ShoppingCartID": id
                }
            };
        
        var result =  documentClient.delete(tempParam, function (err, data) {
                if (err) {
                    console.error("Unable to delete item. Error JSON:", JSON.stringify(err, null, 2));
                    return false;
                } else {
                    console.log("DeleteItem succeeded:", JSON.stringify(data, null, 2));
                    return true;
                
                }
            }).promise();
        
        return result;
        
}


function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}
