// const mongoose = require("mongoose");
// const transactionFunc = async () => {
//   const session = await mongoose.startSession();
//   session.startTransaction();
//   try {
//     await Model.create(data, { session });
//     await Model.findOneAndUpdate({ id }, { Operation }, { new: true, session });
//     // any other operations
//     await session.commitTransaction();
//     //   done with the transaction
//   } catch (err) {
//     //some reason the transaction failed
//     await session.abortTransaction();
//   } finally {
//     // Ending the session
//     session.endSession();
//   }
// };
const { MongoClient, ObjectID } = require("mongodb");
const transaction = async (client) => {
  const accounts = await client.db("sample_analytics").collection("accounts");
  const cutomers = await client.db("sample_analytics").collection("cutomers");
  const session = client.startSession();
  const transactionOptions = {
    readPreference: "primary",
    readConcern: { level: "local" },
    writeConcern: { w: "majority" },
  };
  try {
    const transactionResults = await session.withTransaction(async () => {
      await accounts.updateOne(
        { account_id: 371138 },
        { $set: { limit: 400 } },
        { session }
      );

      const re = await accounts.findOne({ account_id: 371138 }, { session });
      console.log(re);

      if (true) {
        await session.abortTransaction();
        console.log("Transaction aborted");
        return;
      }
    }, transactionOptions);

    if (transactionResults) {
      console.log("Transaction success");
    } else {
      console.log("The transaction was intentionally aborted.");
    }
  } catch (e) {
    console.log(e);
  } finally {
    await session.endSession();
    console.log("Done");
  }
};

const main = async () => {
  const uri = "url of the DB";
  let client;
  try {
    // Connect to the MongoDB cluster
    await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }).then((result) => {
      console.log("Connected to the cluster");
      client = result;
    });
    await transaction(client);
  } catch (e) {
    console.log(e);
  } finally {
    await client.close();
  }
};
main().catch(console.error);
