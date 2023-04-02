;(function (global) {
	global.Ticker = function ({ tickerSelector = '.cc-ticker' }) {
		const tracks = document.querySelectorAll(tickerSelector)

		let animationFrameIDs = new Map()
		let resizeTimeout

		function initializeTicker() {
			tracks.forEach((track) => {
				const windowWidth = window.innerWidth
				const list = track.firstElementChild
				let gap = setGapFromBreakpoint(track) || 0
				const speed = parseFloat(track.getAttribute('ticker-speed')) || 10
				const pauseOnHover =
					track.getAttribute('ticker-pause') === 'true' || false
				const reverse = track.getAttribute('ticker-reverse') === 'true' || false
				let isPaused = false

				function setGapFromBreakpoint(elem) {
					const elementGap = {
						mobile: track.getAttribute('ticker-mobile-gap'),
						tablet: track.getAttribute('ticker-tablet-gap'),
					}

					const ranges = {
						mobile: windowWidth > 0 && windowWidth <= 479,
						tablet:
							elementGap.tablet && windowWidth > 479 && windowWidth <= 1024,
					}

					if (elementGap.mobile && ranges.mobile) {
						return parseInt(elementGap.mobile)
					} else if (elementGap.tablet && ranges.tablet) {
						return parseInt(elementGap.tablet)
					} else {
						return parseInt(track.getAttribute('ticker-gap'))
					}
				}

				function setGap(element, gap) {
					element.setAttribute('style', `gap: ${gap}px;`)
				}

				function cloneList() {
					setGap(list, gap)

					const listWidth = list.clientWidth

					// Remove existing clones
					Array.from(track.children)
						.slice(1)
						.forEach((listClone) => track.removeChild(listClone))

					if (listWidth < windowWidth) {
						const cloneNumber = Math.round((windowWidth * 3) / listWidth - 1)

						for (let i = 0; i < cloneNumber; i++) {
							const listClone = list.cloneNode(true)

							if (reverse) {
								track.insertBefore(listClone, track.firstElementChild)
							} else {
								track.appendChild(listClone)
							}
						}
						setGap(track, gap)

						if (reverse) {
							track.style.justifyContent = 'flex-end'
						}
					} else if (listWidth >= windowWidth) {
						const cloneNumber = 2

						for (let i = 0; i < cloneNumber; i++) {
							const listClone = list.cloneNode(true)

							if (reverse) {
								track.insertBefore(listClone, track.firstElementChild)
							} else {
								track.appendChild(listClone)
							}
						}
						setGap(track, gap)

						if (reverse) {
							track.style.justifyContent = 'flex-end'
						}
					}
				}

				function animate(timestamp, prevTimestamp) {
					const listWidth = list.clientWidth

					if (!prevTimestamp) prevTimestamp = timestamp

					if (!isPaused) {
						const progress = timestamp - prevTimestamp
						const xOffset = (progress * listWidth) / (speed * 1000)
						const direction = reverse ? 1 : -1
						const tickerLists = Array.from(track.children)

						tickerLists.forEach((list) => {
							const newX =
								(parseFloat(list.style.transform.split('(')[1]) || 0) +
								direction * xOffset

							if (reverse) {
								if (newX >= listWidth + gap) {
									list.style.transform = 'translateX(0px)'
								} else {
									list.style.transform = `translateX(${newX}px)`
								}
							} else {
								if (newX <= -(listWidth + gap)) {
									list.style.transform = 'translateX(0px)'
								} else {
									list.style.transform = `translateX(${newX}px)`
								}
							}
						})
					}

					const frameID = requestAnimationFrame((newTimestamp) =>
						animate(newTimestamp, timestamp)
					)
					animationFrameIDs.set(track, frameID)
				}

				if (pauseOnHover) {
					track.addEventListener('mouseenter', () => {
						isPaused = true
					})

					track.addEventListener('mouseleave', () => {
						isPaused = false
					})
				}

				cloneList()
				requestAnimationFrame(animate)
			})
		}

		initializeTicker()

		window.addEventListener('resize', () => {
			clearTimeout(resizeTimeout)
			resizeTimeout = setTimeout(() => {
				// Cancel previous animations
				for (const frameID of animationFrameIDs.values()) {
					cancelAnimationFrame(frameID)
				}
				animationFrameIDs.clear()

				// Re-initialize the ticker
				initializeTicker()
			}, 200)
		})
	}
})((globalThis.CodeCrumbs = globalThis.CodeCrumbs || {}))
