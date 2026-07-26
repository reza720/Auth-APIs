const User = require("./user");
const RefreshToken = require("./refreshTokens");

User.hasMany(RefreshToken, {foreignKey:"user_id"});
RefreshToken.belongsTo(User, {foreignKey:"user_id"});

module.exports = {
    User,
    RefreshToken
};

