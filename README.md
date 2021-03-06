# Action Auctions

#### A web app built with Node.js on AWS

## Requirements
- Node.js
- Elastic Beanstalk CLI

## Setup

```
$ git clone https://github.com/theAlexPatin/CharityLabs.git
$ cd CharityLabs
$ npm install
```

## Running
```
$ npm start
```

## Deploying
```
$ eb deploy
```

## Testing

When entering credit card info, use 4000 0000 0000 0077 with any exp date, cvv, zip 

When setting up Express Payment, use 

 - Routing number: 11000000
 - Account number: 000123456789

### Resources:
- [ElasticBeanstalk tutorial](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html)
- [Stripe API](https://stripe.com/docs/api/python)
