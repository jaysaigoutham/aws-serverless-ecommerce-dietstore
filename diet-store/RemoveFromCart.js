const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

exports.handler = async (event, context, callback) => {
    
    //1. Extract the query parameters & validate
    console.log("Starting...");
    var body = event.body;
    console.log('Body:', event.body);
    if (event.body !== null && event.body !== undefined) {
        if (!(body.ProductID && body.UserId)) 
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
    
    //check if shopping cart has already item added
     const paramsValidation = {
        TableName: 'ShoppingCart',
        KeyConditionExpression: 'ShoppingCartID = :ShoppingCartID',
        ExpressionAttributeValues: {
          ':ShoppingCartID': body.UserId + "-" +body.ProductID
        },
        Limit: 1
      };
      
      

  
  try {
      let result = await documentClient.query(paramsValidation).promise();
        console.log("Result..." + result);
        if (result === undefined || result.Count == 0) {
            return  {
                statusCode: 408,
                body: JSON.stringify({ message: 'The item does not exist' })
              };
        }
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
  

    // Add to shopping cart
    var params = {
        TableName:"ShoppingCart",
        Key:{
            "ShoppingCartID": body.UserId + "-" +body.ProductID
        } //,
        //ConditionExpression:"info.rating <= :val",
        //ExpressionAttributeValues: {
        //    ":val": 5.0
        //}
    }
    
    var response;
    
    
    try {
        const writeOperation = await documentClient.delete(params).promise();
       
      return response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'Item removed from shopping cart' })
      };
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
};
