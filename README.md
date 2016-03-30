# valetuncle-serverside
valetuncle-serverside is an API for valet uncle mobile application using express js and mysql.

> testing IP address: 52.76.211.241  
> production IP address: 52.76.73.21  
> database: 52.76.73.21/edwinslab/edwinslab888/3306  

## PROMO
#### POST: /checkPromo
check wether the promocode is valid or invalid
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: username that want to use the promocode
    - promocode: put the promocode here
response : {"message":"__"}
    - false :
        promocode invalid/ ""
        promocode exceed it limit
        promocode is not available for today
    - true :
        you know this shit
```
#### POST: /getPromo
```sh
params : x-www-form-urlencoded
    - promocode: put the promocode here
response : {"message":"__"}
    - you have entered a wrong promo code :
        promocode invalid/ ""
    - object :
        promo with the specify ID you gave
```

## HISTORY
#### POST: /history
get history from specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - objecId: you know this shit(2)
response : {"message":"__"}
    - error :
        no history with the ID you gave
    - object :
        history with the specify ID you gave
```
#### POST: /toHistory
set status on transaction to finish and put it on table history
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
    - Error :
        Error executing MySQL query
    - err.. :
        error doing data mining
    - history Added !:
        history Added
```

## TRANSACTION
#### POST: /updateTransaction
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - input: query form client to transaction table
response : {"message":"__"}
    - error :
        Error executing MySQL query
    - success :
        error doing data mining
```

#### POST: /driverTemp
get transaction ID where the driverID is equal to the client give as a parameter
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
response : {"message":"__"}
    - err.. :
        Error executing MySQL query
    - success transactionId :
        there you got the transaction ID
```
#### POST: /transaction
get transaction from specify username
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: you know this shit(2)
response : {"message":"__"}
    - Error executing MySQL query :
        Error executing MySQL query
    - Success :
        you will got the information on field "Trans"
```
