import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchServices } from "../actions";
import _debounce from "lodash/debounce";

class ServiceSelect extends Component {

    constructor(props) {
        super(props);
        this.cacheServices = props.modulesManager.getConfiguration("fe-medical", "cacheServices", true);
    }

    componentDidMount() {
        if (this.cacheServices && !this.props.services) {
            this.props.fetchServices();
        }
    }

    getSuggestions = s => this.props.fetchServices(s);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConfiguration("fe-medical", "debounceTime", 500)
    )

    onSuggestionSelected = v => {
        this.props.onServiceSelected(v);
    }

    render() {
        const { intl, services } = this.props;
        return <AutoSuggestion
            items={services}
            placeholder={formatMessage(intl, "medical", "ServiceSelect.placehoder")}
            lookup={i => i.code + i.name}
            getSuggestions={this.cacheServices ? null : this.debouncedGetSuggestion}
            renderSuggestion={i => <span>{i.code} {i.name}</span>}
            getSuggestionValue={i => `${i.code} ${i.name}`}
            onSuggestionSelected={this.onSuggestionSelected}
        />
    }
}

const mapStateToProps = state => ({
    services: state.medical.services,
    fetchingServices: state.medical.fetchingServices,
    fetchedServices: state.medical.fetchedServices,
    errorServices: state.medical.errorServices,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchServices }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ServiceSelect)));