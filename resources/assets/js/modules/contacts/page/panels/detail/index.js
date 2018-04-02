import React from 'react';
import PropTypes from 'prop-types';
import * as MDIcons from 'react-icons/lib/md'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import _ from 'lodash'
import moment from 'moment'
import ChartistGraph from 'react-chartist'
import { NavLink } from 'react-router-dom'

import Opportunities from '../../../../opportunities/partials/_opportunities'
import Companies from "../../../../companies/partials/_companies"
import Contact from '../../../Contact'
import Notes from '../../../../notes/partials/_notes'
import {getContact, getFirstContactId, isStateDirty} from '../../../store/selectors'
import {isInEdit} from "../../../../contacts/store/selectors"
import ListActivities from '../../../../activities/partials/_list'

class Detail extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      view: "default"
    }

    this._toggleView = this._toggleView.bind(this)
  }

  _toggleView(view) {
    this.setState({view})
  }

  render() {
    const { contact, dispatch, user, inEdit } = this.props

    if (contact.id === null) {
      return ''
    }

    switch(this.state.view) {
      case 'default':
        return <Details contact={contact} dispatch={dispatch} toggle={this._toggleView} user={user} inEdit={inEdit} />
      case 'history':
        return <History activities={contact.activities} dispatch={dispatch} toggle={this._toggleView} inEdit={inEdit} />
    }
  }
}

const Details = ({contact, dispatch, toggle, user, inEdit}) => (
  <div className={`col detail-panel border-left ${inEdit ? 'inEdit' : ''}`}>
    <div className="border-bottom  py-2 heading">
      <a href="javascript:void(0)" className="mt-1 btn btn-xs btn-outline-secondary position-absolute r-0 mr-2" onClick={() => toggle('history')}><span className="h5"><MDIcons.MdKeyboardArrowRight /></span></a>
      <div className="pt-1 mt-1 h5 text-center">
        Contact Details
      </div>
    </div>
    <div className="h-scroll">
      <StatusTimeline contact={contact} />
      <ActivityList contact={contact} dispatch={dispatch} />
      <Opportunities opportunities={contact.opportunities} dispatch={dispatch} entityType="App\Contact" entityId={contact.id} />
      <Companies companies={contact.companies} dispatch={dispatch} entityType="App\Contact" entityId={contact.id} />
      <Notes notes={contact.notes} dispatch={dispatch} entityType="App\Contact" entityId={contact.id} user={user} />
    </div>
  </div>
)

const History = ({activities, dispatch, toggle, inEdit}) => (
  <div className={`col detail-panel border-left ${inEdit ? 'inEdit' : ''}`}>
    <div className="border-bottom py-2 heading">
      <a href="javascript:void(0)" className="btn btn-xs btn-outline-secondary position-fixed ml-2 mt-1" onClick={() => toggle('default')}><span className="h5"><MDIcons.MdKeyboardArrowLeft /></span></a>
      <div className="pt-1 mt-1 h5 text-center">History</div>
    </div>
    <div className="h-scroll history">
      {activities.map(activity => (
        <div className="list-group-item" key={`activity-history-${activity.id}`}>
          <span className="text-muted float-right mini-text">{moment(activity.created_at).fromNow()}</span>
          <div className="activity"><b>{activity.name}</b></div>
          <div dangerouslySetInnerHTML={{__html: activity.description}} />
        </div>
      ))}
    </div>
  </div>
)

const StatusTimeline = ({contact}) => {
  const data = {series: [[null, null, null, 1, 1], [1, 1, 1, 1,null]] }
  const options = {
    low: 0,
    high: 2,
    fullWidth: true,
    height: "50px",
    showArea: false,
    showLabel: false,
    axisX: {
      showGrid: false,
      showLabel: false,
      offset: 0
    },
    axisY: {
      showGrid: false,
      showLabel: false,
      offset: 0
    }
  }

  const firstNotCompleted = _.find(contact.activities, a => !a.completed)
  const link = firstNotCompleted
    ? <NavLink to={`/headquarters/${firstNotCompleted.id}`}>{firstNotCompleted.name}</NavLink>
    : 'All caught up!'

  return (
    <div className="card ct-container-inverse">
      <div className="card-header" id="statusTimeline">
        <h6 className="mb-0" data-toggle="collapse" data-target="#collapseTimeline" aria-expanded="true" aria-controls="collapseTimeline">
          <MDIcons.MdKeyboardArrowDown /> Snapshot
        </h6>
      </div>
      <div id="collapseTimeline" className="collapse show" aria-labelledby="statusTimeline">
        <div className="card-body border-bottom">
          <div className="h1 text-center">{contact.status.name}</div>
          <div className="text-center mini-text text-muted text-uppercase pb-2"><MDIcons.MdAccessTime /> Last touched <span className="text-dark">{moment(contact.updated_at).fromNow()}</span></div>
          <ChartistGraph data={data} options={options} type="Line" className="status-timeline" />
          <div className="mini-text text-muted font-weight-bold text-uppercase mt-2">Next Task</div>
          <p>{link}</p>
        </div>
      </div>
    </div>
  )
}

const ActivityList = ({contact, dispatch}) => {
  const filtered = _.filter(contact.activities, a => a.details_type !== 'App\\FieldUpdateActivity')

  return (
    <div className="card ct-container">
      <div className="card-header" id="taskList">
        <h6 className="mb-0" data-toggle="collapse" data-target="#collapseTasks" aria-expanded="true" aria-controls="collapseTasks">
          <MDIcons.MdKeyboardArrowDown /> Tasks
        </h6>
      </div>
      <div id="collapseTasks" className="collapse mh-200" aria-labelledby="taskList">
        <div className="list-group">
          <ListActivities activities={filtered} dispatch={dispatch} view={'headquarters'} />
        </div>
      </div>
    </div>
  )
}

Detail.propTypes = {
  contact: PropTypes.instanceOf(Contact).isRequired,
  user: PropTypes.object.isRequired
}

export default withRouter(connect((state, ownProps) => ({
  contact: getContact(state, ownProps.match.params.id || getFirstContactId(state)),
  user: state.user,
  isFetching: isStateDirty(state),
  inEdit: isInEdit(state)
}))(Detail))
