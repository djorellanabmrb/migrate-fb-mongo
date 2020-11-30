const {FirebaseConfig } = require("configs-twtg");
const admin = require("firebase-admin");
const  TwtgOdm  = require("odm-twtg");
const twtOdm = new TwtgOdm();
twtOdm.connect();

admin.initializeApp({
    credential: admin.credential.cert(FirebaseConfig.credential),
    databaseURL: FirebaseConfig.databaseURL
});

const getDeliveries = async(state) =>{
    let now = new Date();
    
    admin.firestore()
    .collection('deliveries').where(`stateTime.${state}`, '<=', now).get()
    .then(snapshot =>{
        snapshot.forEach(async doc =>{
            let deliveryDoc = await admin.firestore().collection('deliveries').doc(doc.id).get();
            let deliveryData = await deliveryDoc.data();
            for (var key in deliveryData.stateTime) {
                let date = new Date(deliveryData.stateTime[key].seconds * 1000);
                deliveryData.stateTime[key] = date;
            }
            let deliveryModel = {
                address: deliveryData.address,
                userType: deliveryData.alert,
                alias:{
                    id: (deliveryData.alias != undefined) ? deliveryData.alias.id : undefined,
                    name: (deliveryData.alias != undefined) ? deliveryData.alias.name : undefined
                },
                branch:{
                    id:  (deliveryData.branch != undefined) ? deliveryData.branch.id : undefined,
                    name: (deliveryData.branch != undefined) ? deliveryData.branch.name : undefined,
                    address: (deliveryData.branch != undefined) ? deliveryData.branch.address : undefined,
                    point: (deliveryData.branch != undefined) ? {
                        type: 'Point',
                        coordinates:[deliveryData.branch.lat || 0, deliveryData.branch.lng || 0]
                    } : undefined
                },
                circle:{
                    id: (deliveryData.circle != undefined) ? deliveryData.circle.id : undefined,
                    distance: (deliveryData.circle != undefined) ? deliveryData.circle.distance : undefined,
                    time: (deliveryData.circle != undefined) ? deliveryData.circle.time : undefined
                },
                company: {
                    id: (deliveryData.company != undefined) ? deliveryData.company.id : undefined,
                    name: (deliveryData.company != undefined) ? deliveryData.company.name : undefined
                },
                distanceTraveled: deliveryData.distanceTraveled,
                locationEnd: (deliveryData.locationEnd != undefined) ? {
                    type: 'Point',
                    coordinates:[deliveryData.locationEnd._latitude || 0, deliveryData.locationEnd._longitude || 0]
                } : undefined,
                locationRef: (deliveryData.locationRef != undefined) ? {
                    type: 'Point',
                    coordinates:[deliveryData.locationRef._latitude || 0, deliveryData.locationRef._longitude || 0]
                } : undefined,
                name: deliveryData.name,
                nota: deliveryData.nota,
                orderId: deliveryData.orderId,
                orderPic: deliveryData.orderPic,
                phone: deliveryData.phone,
                provider: deliveryData.provider,
                receivedPic: deliveryData.receivedPic,
                status: state,
                time: deliveryData.time,
                rating: (deliveryData.DeliveryCali != undefined) ? {
                    calification: deliveryData.DeliveryCali.Calification || undefined,
                    opinion:  deliveryData.DeliveryCali.Opinion  || undefined
                } : undefined,
                depto: {
                    name: deliveryData.depto || undefined,
                    id: undefined
                },
                muni: {
                    name: deliveryData.muni || undefined,
                    id: undefined
                },
                zone: {
                    name: deliveryData.zone || undefined,
                    id: undefined
                },
                alert: deliveryData.alert,
                orderObservations: deliveryData.orderObservations,
                statusTimes: deliveryData.stateTime
            }
            try {
                const _deliveryModel = new twtOdm.db.DeliveryModel(deliveryModel);
                await _deliveryModel.save();     
            } catch (error) {
                console.log(error);
            } 
        })
    })
}

getDeliveries("Entregado");
getDeliveries("Cancelado");