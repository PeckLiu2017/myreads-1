import React from 'react';
import { Link, Route } from 'react-router-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';
import Bookshelf, { getBookshelfCategories, getBookshelfCategoryName } from './Bookshelf';
import * as BooksAPI from './BooksAPI';
import Search from './Search';
import sortBy from 'sort-by';
import './App.css';

class BooksApp extends React.Component {

	state = {books: []};

	/**
	 * Lifecycle event handler called just after the App loads into the DOM.
	 * Call the API to get all books and update books state variable when the callback returns.
	 */
	componentDidMount() {
		// Update the Shelves
		BooksAPI.getAll().then((books) => {
			this.setState({books: books});
		});
	}

	updateBook = (book, shelf) => {
		// If books state array is not empty
		if (this.state.books) {

			// Update book state to include loading variable used at updating animation
			book.updating = true;
			this.setState(state => ({
				books: state.books.filter(b => b.id !== book.id).concat([book])
			}));

			// Update book reference at remote server, if successful update local state reference also
			BooksAPI.update(book, shelf).then(() => {
				book.shelf = shelf;
				book.updating = false;
				// This will update all Bookshelf components since it will force call render and the book will move
				// to the correct shelf.
				this.setState(state => ({
					books: state.books.filter(b => b.id !== book.id).concat([book])
				}));
			});
		}
	};

	render() {
		return (
			<MuiThemeProvider>
				<div className="app">
					<Route exact path='/' render={() => (
						<div className="list-books">
							<AppBar
								title="MyReads"
								iconClassNameRight="muidocs-icon-navigation-expand-more"
							/>
							<div className="list-books-content">
								<div>
									{getBookshelfCategories().map((shelf) => (
										<div key={shelf} className="bookshelf">
											<h2 className="bookshelf-title">{getBookshelfCategoryName(shelf)}</h2>
											<Bookshelf
												books={this.state.books.filter((book) => book.shelf === shelf).sort(sortBy('title'))}
												category={shelf}
												onUpdateBook={this.updateBook}
											/>
										</div>
									))}
								</div>
							</div>
							<div className="open-search">
								<Link
									to='/search'
									className='add-books'
								>
									<FloatingActionButton>
										<ContentAdd />
									</FloatingActionButton>
								</Link>

							</div>
						</div>
					)}/>
					<Route path='/search' render={({history}) => (
						<Search
							shelvesBooks={this.state.books}
							onUpdateBook={this.updateBook}
						/>
					)}/>
				</div>
			</MuiThemeProvider>
		);
	}
}

export default BooksApp;