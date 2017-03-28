const apiKey = 'XriRAsdFawgr7IsOMsK7QARfi4kY3zD1myqBL10rqW9JZmjJO8'
const limit = 50
let imageCount = 0

function loadImages(username) {
	axios.get(`https://api.tumblr.com/v2/blog/${username}.tumblr.com/likes`, {
		params: {
			api_key: apiKey
		},
		limit: limit,
		offset: imageCount
	})
		.then((response) => {
			try {
				const container = document.getElementById('tile-container')
				const posts = response.data.response.liked_posts
				posts.forEach((post) => {
					const tile = document.createElement('div')
					tile.classList.add('tile')
					container.appendChild(tile)
				})
			}
			catch (error) {
				console.error(error)
			}
		})
		.catch((error) => {
			console.error(error)
		})
}

document.addEventListener('DOMContentLoaded', () => {
	loadImages('jonasluebbers')
})