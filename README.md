# valetuncle-serverside
valetuncle-serverside is an API for valet uncle mobile application using express js and mysql.

> testing IP address: 52.76.211.241  
> production IP address: 52.76.73.21  
- database:  
  - host     : 'valetunclelive.crdghclhttrn.ap-southeast-1.rds.amazonaws.com',  
  - user     : 'vu_userdb',  
  - password : 'damn5hitfuck5ake',  
  - database : 'valetuncle'
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
#### POST: /transactionInsert
inserting a transaction
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username
    - actualLocation
    - promoCode
    - fee
    - notif
    - pickUp
    - remark
    - destinationAddress
    - pickUpAddress
response : {"message":"__"}
    - error
    - success
```

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

#### POST: /getTransaction
check is there any transaction for the driver with the specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /getDistance
check is there any transaction for the driver with the specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - driverLoc: driver geolocation
response : {"message":"__"}
    - err..:
    - distance
```

#### DELETE: /transaction
check is there any transaction for the driver with the specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: you know this shit(2)
response : {"message":"__"}
```
#### POST: /cancelTrans
canceling the transaction, set the transaction status to cancel (not literally delete the transaction) based on username
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: you know this shit(2)
response : {"message":"__"}
    - err:
    - successfully delete transaction
```

#### POST: /cancelTransaction
canceling the transaction, set the transaction status to cancel (not literally delete the transaction) based on ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: you know this shit(2)
response : {"message":"__"}
    - err:
    - successfully delete transaction
```

#### POST: /cancelDriver
canceling he transaction, set the transaction status to cancel (not literally delete the transaction) based on ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - reason: you know this shit(3)
response : {"message":"__"}
    - Error executing MySQL query:
    - successfully delete transaction
```

## DRIVER
#### POST: /driverNotif
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /testNotif
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /driver
get all data from driver from specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - objectId: you know this shit(2)
response : {"message":"__"}
```
#### POST: /driverNumber
get all data from driver from specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - objectId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /checkStartJob
check startJob status on transaction form specify ID
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /checkUsername
check is the usr is already been deleted
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username: you know this shit(2)
response : {"message":"__"}
```

#### POST: /updateRating
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
    - review:
    - newRating:
response : {"message":"__"}
```
#### POST: /review
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - review:
response : {"message":"__"}
```

#### POST: /setFlag
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
response : {"message":"__"}
```
#### POST: /updateDriver
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - objectId: you know this shit(2)
    - input: query form client to transaction table
response : {"message":"__"}
```

#### POST: /imei
check if statusLogin from specify IMEI
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - imei: you know this shit(2)
response : {"message":"__"}
```

#### POST: /loginDriver
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - imei: you know this shit(2)
    - idNumber:
response : {"message":"__"}
```

#### POST: /getDriverAnswer
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - driverId: you know this shit(3)
    - answer:
response : {"message":"__"}
```

#### POST: /getDriverAnswer_edit
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - driverId: you know this shit(3)
    - answer:
response : {"message":"__"}
```

#### POST: /transactionDecline
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - driverId: you know this shit(3)
response : {"message":"__"}
```

#### POST: /balance
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(3)
response : {"message":"__"}
```

#### POST: /cekDriver
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - driverId: you know this shit(2)
    - transId: you know this shit(3)
response : {"message":"__"}
```

#### POST: /checkHere
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(3)
response : {"message":"__"}
```

#### POST: /setDriverId
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
```

## MULTIDRIVER
#### POST: /transaction_multipledriver
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
```

#### DELETE: /transaction_multipledriver
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
```

#### POST: /cancelTransMulti
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
    - username: you know this shit(2)
response : {"message":"__"}
```

#### POST: /transactionInsert_multipledriver
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - username:
    - actualLocation: geolocation
    - promocode: you know this shit(2)
response : {"message":"__"}
```
#### POST: /checkUsername_multipledriver
push notif android
```sh
params : x-www-form-urlencoded
    - token: you know this shit
    - transId: you know this shit(2)
response : {"message":"__"}
```
