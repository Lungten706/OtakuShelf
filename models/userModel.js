class User {
    constructor(username, email, favoriteGenre) {
        this.username = username;
        this.email = email;
        this.favoriteGenre = favoriteGenre;
    }

    static async getUserProfile(userId) {
        // This would fetch from your database
        // Mock data for now
        return new User('Zangmo', 'zangmo@gmail.com', 'Fantasy');
    }

    static async updateProfile(userId, userData) {
        // This would update the database
        // Implementation depends on your database setup
    }
}

module.exports = User;
