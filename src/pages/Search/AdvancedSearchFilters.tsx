import React, {useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useSingleExecution from '@hooks/useSingleExecution';
import useThemeStyles from '@hooks/useThemeStyles';
import useWaitForNavigation from '@hooks/useWaitForNavigation';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchAdvancedFiltersForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/SearchAdvancedFiltersForm';

// the values of dateBefore+dateAfter map to just a single 'date' field on advanced filters
type AvailableFilters = ValueOf<typeof INPUT_IDS> | 'date';

function getFilterDisplayTitle(filters: Partial<SearchAdvancedFiltersForm>, fieldName: AvailableFilters, translate: LocaleContextProps['translate']) {
    if (fieldName === 'date') {
        const {dateAfter, dateBefore} = filters;
        let dateValue = '';
        if (dateBefore) {
            dateValue = translate('search.filters.date.before', dateBefore);
        }
        if (dateBefore && dateAfter) {
            dateValue += ', ';
        }
        if (dateAfter) {
            dateValue += translate('search.filters.date.after', dateAfter);
        }

        return dateValue;
    }

    if (fieldName === INPUT_IDS.TYPE) {
        // return filters[fieldName] ? filters[fieldName].toUpperCase() : '';
        return filters[fieldName];
    }

    return filters[fieldName];
}

function AdvancedSearchFilters() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {singleExecution} = useSingleExecution();
    const waitForNavigate = useWaitForNavigation();

    const [searchAdvancedFilters = {}] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM);

    const advancedFilters = useMemo(
        () => [
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, 'type', translate),
                description: 'common.type' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_TYPE,
            },
            {
                title: getFilterDisplayTitle(searchAdvancedFilters, 'date', translate),
                description: 'common.date' as const,
                route: ROUTES.SEARCH_ADVANCED_FILTERS_DATE,
            },
        ],
        [searchAdvancedFilters, translate],
    );

    return (
        <View>
            {advancedFilters.map((item) => {
                const onPress = singleExecution(waitForNavigate(() => Navigation.navigate(item.route)));

                return (
                    <MenuItemWithTopDescription
                        key={item.description}
                        title={item.title}
                        description={translate(item.description)}
                        shouldShowRightIcon
                        onPress={onPress}
                    />
                );
            })}
            <FormAlertWithSubmitButton
                buttonText={translate('search.viewResults')}
                containerStyles={[styles.mh4, styles.mt4]}
                onSubmit={() => {
                    // here set the selected filters as new query and redirect to SearchResults page
                    // waiting for: https://github.com/Expensify/App/issues/45028 and https://github.com/Expensify/App/issues/45027
                    Navigation.goBack();
                }}
            />
        </View>
    );
}

AdvancedSearchFilters.displayName = 'AdvancedSearchFilters';

export default AdvancedSearchFilters;
