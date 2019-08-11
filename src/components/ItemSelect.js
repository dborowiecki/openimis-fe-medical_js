import React, { Component } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { injectIntl } from 'react-intl';
import { formatMessage, AutoSuggestion, withModulesManager } from "@openimis/fe-core";
import { fetchItems } from "../actions";
import _debounce from "lodash/debounce";

class ItemSelect extends Component {

    constructor(props) {
        super(props);
        this.cache = props.modulesManager.getConf("fe-medical", "cacheItems", true);
    }

    componentDidMount() {
        if (this.cache && !this.props.items) {
            this.props.fetchItems();
        }
    }

    getSuggestions = str => !!str &&
        str.length >= this.props.modulesManager.getConf("fe-medical", "itemsMinCharLookup", 2) &&
        this.props.fetchItems(str);

    debouncedGetSuggestion = _debounce(
        this.getSuggestions,
        this.props.modulesManager.getConf("fe-medical", "debounceTime", 800)
    )

    formatSuggestion = i => `${i.code} ${i.name}`

    onSuggestionSelected = v => this.props.onChange(v, this.formatSuggestion(v));

    render() {
        const { intl, items, withLabel=true, label, withPlaceholder=false, placeholder } = this.props;
        return <AutoSuggestion
            items={items}
            label={!!withLabel && (label || formatMessage(intl, "medical", "Items"))}
            placeholder={!!withPlaceholder ? (placeholder || formatMessage(intl, "medical", "ItemSelect.placehoder")) : null}
            getSuggestions={this.cache ? null : this.debouncedGetSuggestion}
            getSuggestionValue={this.formatSuggestion}
            onSuggestionSelected={this.onSuggestionSelected}
        />
    }
}

const mapStateToProps = state => ({
    items: state.medical.items,
});

const mapDispatchToProps = dispatch => {
    return bindActionCreators({ fetchItems }, dispatch);
};

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(
    withModulesManager(ItemSelect)));
