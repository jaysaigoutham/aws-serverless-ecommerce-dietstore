AddProduct 

const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-2'});

exports.handler = async (event, context, callback) => {
    
    //1. Extract the query parameters & validate
    var body = event.body;
    console.log('Body:', event.body);
    if (event.body !== null && event.body !== undefined) {
        if (!(body.ProductID && body.ProductName && body.Quantity)) 
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
    
    
    var params = {
        TableName: "Product",
        Item: {
            'ProductID' : body.ProductID,
            'ProductName': body.ProductName,
            'Quantity' : body.Quantity,
            'UpdatedAt': Math.round((new Date()).getTime() / 1000)
        }
    };
    
    var response;
    
    
    try {
        const writeOperation = await documentClient.put(params).promise();
       
      return response = {
    statusCode: 200,
    body: JSON.stringify({ message: 'Product added sucessfully' })
  };
     
      
    } catch (e) {
      console.log(e.message);
      
      return {
          statusCode: 408,
          body: JSON.stringify({message: 'There was some type of catastrophic error', error:e})
      };
    }
    
    
    
    
    return response;
};
