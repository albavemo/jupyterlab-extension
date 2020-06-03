import React, { useState } from 'react';
import { createUseStyles } from 'react-jss';
import qs from 'querystring';
import { useStoreState } from 'pullstate';
import { ExtensionStore } from '../stores/ExtensionStore';
import { TextField } from '../components/TextField';
import { HorizontalHeading } from '../components/HorizontalHeading';
import { FileDIDListItem } from '../components/FileDIDListItem';
import { requestAPI } from '../utils/ApiRequest';
import { Spinning } from '../components/Spinning';

const useStyles = createUseStyles({
  searchContainer: {
    padding: '8px'
  },
  resultsContainer: {},
  filterContainer: {
    padding: '0 16px 0 16px',
    fontSize: '9pt'
  },
  searchButton: {
    alignItems: 'center',
    padding: '4px',
    lineHeight: 0,
    cursor: 'pointer'
  },
  searchIcon: {
    color: '#2196F390',
    '&:hover': {
      color: '#2196F3'
    }
  },
  dropdown: {
    color: '#2196F3',
    cursor: 'pointer',
    marginLeft: '4px'
  },
  listItem: {
    borderBottom: '1px solid #E0E0E0',
    padding: '8px 16px 8px 16px',
    cursor: 'pointer',
    'background-size': 'auto 50%',
    'background-position': 'right 16px center',
    backgroundRepeat: 'no-repeat',
    '&:last-child': {
      borderBottom: 'none'
    },
    '&:hover': {
      backgroundColor: '#eeeeee'
    }
  },
  loading: {
    padding: '32px 16px 16px 16px',
    '& span': {
      verticalAlign: 'middle',
      paddingLeft: '4px'
    }
  },
  icon: {
    fontSize: '10pt',
    verticalAlign: 'middle'
  }
});

export const Explore: React.FunctionComponent = () => {
  const classes = useStyles();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<string[]>();
  const [loading, setLoading] = useState(false);
  const activeInstance = useStoreState(ExtensionStore, s => s.activeInstance);

  const query = {
    namespace: activeInstance.name,
    did: searchQuery
  };

  const doSearch = () => {
    setLoading(true);
    setSearchResult(undefined);
    requestAPI<string[]>(`files?${qs.encode(query)}`)
      .then(result => setSearchResult(result))
      .catch(e => console.log(e)) // TODO error handling
      .finally(() => setLoading(false));
  };

  const searchButton = (
    <div className={classes.searchButton} onClick={doSearch}>
      <i className={`${classes.searchIcon} material-icons`}>search</i>
    </div>
  );

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      doSearch();
    }
  };

  return (
    <div>
      <div className={classes.searchContainer}>
        <TextField
          outlineColor="#E0E0E0"
          placeholder="Enter a Data Identifier (DID)"
          after={searchButton}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
        />
      </div>
      {loading && (
        <div className={classes.loading}>
          <Spinning className={`${classes.icon} material-icons`}>
            hourglass_top
          </Spinning>
          <span>Loading...</span>
        </div>
      )}
      {!!searchResult && (
        <>
          <HorizontalHeading title="Search Results" />
          <div className={classes.resultsContainer}>
            {searchResult.map(did => (
              <FileDIDListItem did={did} key={did} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
