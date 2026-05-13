import { User, initUserModel } from './User';
import { Item, initItemModel } from './Item';
import { Bid, initBidModel } from './Bid';
import { Tier, initTierModel } from './Tier';
import { WalletTransaction, initWalletTransactionModel } from './WalletTransaction';
import { WithdrawRequest, initWithdrawRequestModel } from './WithdrawRequest';
import { FanAssociation, initFanAssociationModel } from './FanAssociation';
import { FanMember, initFanMemberModel } from './FanMember';

let initialized = false;

export function initAllModels() {
    if (initialized) return;

    // Initialize all models
    initUserModel();
    initItemModel();
    initBidModel();
    initTierModel();
    initWalletTransactionModel();
    initWithdrawRequestModel();
    initFanAssociationModel();
    initFanMemberModel();

    // Define associations
    // User <-> Item
    User.hasMany(Item, { foreignKey: 'sellerId', as: 'sellerItems' });
    Item.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
    Item.belongsTo(User, { foreignKey: 'highestBidderId', as: 'highestBidder' });
    Item.belongsTo(User, { foreignKey: 'winnerId', as: 'winner' });

    // User <-> Bid
    User.hasMany(Bid, { foreignKey: 'userId', as: 'bids' });
    Bid.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // Item <-> Bid
    Item.hasMany(Bid, { foreignKey: 'itemId', as: 'bids' });
    Bid.belongsTo(Item, { foreignKey: 'itemId', as: 'item' });

    // User <-> WalletTransaction
    User.hasMany(WalletTransaction, { foreignKey: 'userId', as: 'walletTransactions' });
    WalletTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
    WalletTransaction.belongsTo(Item, { foreignKey: 'auctionId', as: 'auction' });

    // User <-> WithdrawRequest
    User.hasMany(WithdrawRequest, { foreignKey: 'userId', as: 'withdrawRequests' });
    WithdrawRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

    // User <-> FanAssociation
    User.hasMany(FanAssociation, { foreignKey: 'presidentId', as: 'fanAssociations' });
    FanAssociation.belongsTo(User, { foreignKey: 'presidentId', as: 'president' });

    // FanAssociation <-> FanMember
    FanAssociation.hasMany(FanMember, { foreignKey: 'associationId', as: 'members' });
    FanMember.belongsTo(FanAssociation, { foreignKey: 'associationId', as: 'association' });

    initialized = true;
}

export { User, Item, Bid, Tier, WalletTransaction, WithdrawRequest, FanAssociation, FanMember };
