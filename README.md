# CharityLabs (unnamed) Web App

#### A web app built with Django on AWS

## Requirements
- [Python 3](https://www.python.org/downloads/)
- [Elastic Beanstalk CLI](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3-install.html)

## Cloning

In the desired directory run `git clone https://github.com/theAlexPatin/CharityLabs.git`

## Setup

Install virtualenv if you don't have it: `$ pip install virtualenv`

Then from the root of the project:
```
$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ deactivate
```

## Running
From root of project:
```
$ source venv/bin/activate
$ python3 manage.py runserver
```

## Making Model Schema Changes:
```
$ python3 manage.py makemigrations
$ python3 manage.py migrate
```

## Deploying Changes
```
$ eb deploy
```

## Technologies Used:
- Django
- AWS ElasticBeanstalk
- AWS RDS (PostgreSQL)
- Stripe API
- Celery (automated task management)

### Resources:
- [Django tutorial](http://www.tutorialspoint.com/django/)
- [ElasticBeanstalk tutorial](http://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-python-django.html)
- [Stripe API](https://stripe.com/docs/api/python)
- [Celery tutorial](http://celery.readthedocs.io/en/latest/userguide/tasks.html)
- [PostgresSQL](https://www.tutorialspoint.com/postgresql/)