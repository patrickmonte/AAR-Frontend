import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Grid, Pagination } from 'react-bootstrap'
import { connect } from 'react-redux'
import { invalidateMissions, fetchMissionsIfNeeded, setMissionsFilter, setMissionsPage } from '../actions/missions'
import MissionsFilter from '../components/MissionsFilter'
import Missions from '../components/Missions'

const MISSIONS_PER_PAGE = 20

class MissionsList extends Component {
  constructor (props) {
    super(props)
    this.handleRefreshClick = this.handleRefreshClick.bind(this)
    this.handlePageSelect = this.handlePageSelect.bind(this)
  }

  componentDidMount () {
    this.invalidate()
  }

  handleRefreshClick (e) {
    e.preventDefault()

    this.invalidate()
  }

  invalidate () {
    const { dispatch } = this.props
    dispatch(invalidateMissions())
    dispatch(fetchMissionsIfNeeded())
  }

  handlePageSelect (page) {
    const { dispatch } = this.props
    dispatch(setMissionsPage(page))
  }

  setFilter (filter) {
    const { dispatch } = this.props
    dispatch(setMissionsFilter(filter))
  }

  render () {
    const { filter, filteredMissions, page, isFetching, lastUpdated } = this.props

    const refreshHeader = (
      <div>
        {lastUpdated &&
          <span>
            Last updated at {new Date(lastUpdated).toLocaleTimeString()}.
            {' '}
          </span>
        }
        {!isFetching &&
          <a href='#'
            onClick={this.handleRefreshClick}>
            Refresh
          </a>
        }
      </div>
    )

    const missionsFilter = (
      <div>
        <h4>Filter</h4>
        <MissionsFilter setFilter={this.setFilter.bind(this)} {...filter} />
      </div>
    )

    const pages = Math.ceil(filteredMissions.length / MISSIONS_PER_PAGE)
    const paginatedMissions = filteredMissions.slice((page - 1) * MISSIONS_PER_PAGE, page * MISSIONS_PER_PAGE)
    const missionsList = (
      <div style={{ opacity: isFetching ? 0.5 : 1 }}>
        <Missions missions={paginatedMissions} />

        <div className='text-center'>
          <Pagination
            items={pages}
            activePage={page}
            boundaryLinks
            maxButtons={10}
            onSelect={this.handlePageSelect} />
        </div>
      </div>
    )

    return (
      <Grid>
        {missionsFilter}
        {refreshHeader}
        {isFetching && filteredMissions.length === 0 &&
          <h2>Loading...</h2>
        }
        {!isFetching && filteredMissions.length === 0 &&
          <h2>Empty.</h2>
        }
        {filteredMissions.length > 0 &&
          missionsList
        }
      </Grid>
    )
  }
};

MissionsList.propTypes = {
  filteredMissions: PropTypes.array.isRequired,
  isFetching: PropTypes.bool.isRequired,
  lastUpdated: PropTypes.number,
  dispatch: PropTypes.func.isRequired
}

function mapStateToProps (state) {
  const {
    isFetching,
    lastUpdated,
    filter,
    filteredMissions,
    page
  } = state.missions || {
    isFetching: true,
    filter: {},
    filteredMissions: [],
    page: 1
  }

  return {
    filter,
    filteredMissions,
    isFetching,
    lastUpdated,
    page
  }
}

export default connect(mapStateToProps)(MissionsList)
