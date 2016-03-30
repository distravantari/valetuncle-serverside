# valetuncle-serverside
valetuncle-serverside is an API for valet uncle mobile application using express js and mysql.

> testing IP address: 52.76.211.241  
> production IP address: 52.76.73.21  
> database: 52.76.73.21/edwinslab/edwinslab888/3306  

## PROMO
#### POST: /checkPromo
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
        [{"id":integer,"code":"String","description":"String","discount":integer,"limit":integer,"day":integer}]
```
